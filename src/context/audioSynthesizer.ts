import type { AmbientSoundType } from '../types'

class AudioSynthManager {
  private ctx: AudioContext | null = null
  private noiseNode: AudioBufferSourceNode | null = null
  private gainNode: GainNode | null = null
  private currentType: AmbientSoundType = 'none'
  private volume: number = 0.3


  constructor() {
    // Lazy initialize when user interacts
  }

  private initContext() {
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        this.ctx = new AudioCtx()
        this.gainNode = this.ctx.createGain()
        this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime)
        this.gainNode.connect(this.ctx.destination)
      } catch (e) {
        console.error('Failed to initialize AudioContext:', e)
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  // Generate 2 seconds of White Noise
  private createWhiteNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('No context')
    const bufferSize = this.ctx.sampleRate * 2
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    return buffer
  }

  // Generate 2 seconds of Brown Noise (deeper, warmer focus sound)
  private createBrownNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('No context')
    const bufferSize = this.ctx.sampleRate * 2
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let lastOut = 0.0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      data[i] = (lastOut + 0.02 * white) / 1.02
      lastOut = data[i]
      data[i] *= 3.5 // compensation gain
    }
    return buffer
  }

  // Generate Rain Buffer (brown noise base + high pass crackles)
  private createRainBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('No context')
    const bufferSize = this.ctx.sampleRate * 3
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let lastOut = 0.0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      // Brown noise component
      const brown = (lastOut + 0.015 * white) / 1.015
      lastOut = brown
      
      // Rain drops (very short high frequency spikes)
      let crackle = 0
      if (Math.random() < 0.0015) {
        crackle = (Math.random() * 2 - 1) * 0.12
      }
      
      data[i] = (brown * 2.2) + crackle
    }
    return buffer
  }

  public setVolume(vol: number) {
    this.volume = vol
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.1)
    }
  }

  public getVolume(): number {
    return this.volume
  }

  public getCurrentType(): AmbientSoundType {
    return this.currentType
  }

  public play(type: AmbientSoundType) {
    this.initContext()
    if (!this.ctx || !this.gainNode) return

    this.stop()
    this.currentType = type

    if (type === 'none' || type === 'metronome') {
      return // Metronome clicks on demand, no looping background noise
    }

    let buffer: AudioBuffer
    try {
      if (type === 'white-noise') {
        buffer = this.createWhiteNoiseBuffer()
      } else if (type === 'brown-noise') {
        buffer = this.createBrownNoiseBuffer()
      } else if (type === 'rain') {
        buffer = this.createRainBuffer()
      } else {
        return
      }

      const source = this.ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true

      // Low pass filter to make it warmer
      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(type === 'rain' ? 1400 : 750, this.ctx.currentTime)

      source.connect(filter)
      filter.connect(this.gainNode)

      source.start(0)
      this.noiseNode = source
    } catch (e) {
      console.error('Failed to play synthesized soundscape:', e)
    }
  }

  public stop() {
    if (this.noiseNode) {
      try {
        this.noiseNode.stop()
      } catch (e) {
        // Already stopped
      }
      this.noiseNode.disconnect()
      this.noiseNode = null
    }
    this.currentType = 'none'
  }

  // Play a soft click sound for the metronome
  public playTick() {
    this.initContext()
    if (!this.ctx || !this.gainNode || this.currentType !== 'metronome') return

    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(320, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.06)

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06)

      osc.connect(gain)
      gain.connect(this.gainNode)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.06)
    } catch (e) {
      // Audio node error
    }
  }

  // Play a beautiful bell/chime note sequence on completion
  public playSessionChime(isBreak: boolean) {
    this.initContext()
    if (!this.ctx || !this.gainNode) return

    try {
      const now = this.ctx.currentTime
      const notes = isBreak ? [392, 523, 659] : [659, 523, 392] // Arpeggio upwards for break, downwards for focus

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator()
        const gain = this.ctx!.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.12)

        gain.gain.setValueAtTime(0.0, now + idx * 0.12)
        gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.12 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.5)

        osc.connect(gain)
        gain.connect(this.gainNode!)

        osc.start(now + idx * 0.12)
        osc.stop(now + idx * 0.12 + 0.5)
      })
    } catch (e) {
      // Audio issue
    }
  }
}

export const audioSynth = new AudioSynthManager()
