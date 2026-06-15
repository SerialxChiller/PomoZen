import type { AmbientSoundType } from '../types'

class AudioSynthManager {
  private ctx: AudioContext | null = null
  private noiseNode: AudioBufferSourceNode | null = null
  private gainNode: GainNode | null = null
  private filterNode: BiquadFilterNode | null = null
  private currentType: AmbientSoundType = 'none'
  private volume: number = 0.3

  constructor() {
    // Lazy initialize when user interacts
  }

  private async ensureContext(): Promise<boolean> {
    // If context was closed by the browser (tab suspension), re-create it
    if (this.ctx?.state === 'closed') {
      this.cleanupNodes()
      this.ctx = null
      this.gainNode = null
    }

    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        this.ctx = new AudioCtx()
        this.gainNode = this.ctx.createGain()
        this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime)
        this.gainNode.connect(this.ctx.destination)
      } catch (e) {
        console.error('Failed to initialize AudioContext:', e)
        return false
      }
    }

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume()
      } catch (e) {
        console.error('Failed to resume AudioContext:', e)
        return false
      }
    }

    return this.ctx !== null
  }

  private cleanupNodes() {
    if (this.noiseNode) {
      try { this.noiseNode.stop() } catch { /* already stopped */ }
      try { this.noiseNode.disconnect() } catch { /* already disconnected */ }
      this.noiseNode = null
    }
    if (this.filterNode) {
      try { this.filterNode.disconnect() } catch { /* already disconnected */ }
      this.filterNode = null
    }
  }

  public async resumeContext(): Promise<boolean> {
    return this.ensureContext()
  }

  // Generate 10 seconds of White Noise (longer buffer for iOS loop reliability)
  private createWhiteNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('No context')
    const bufferSize = this.ctx.sampleRate * 10
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    return buffer
  }

  // Generate 10 seconds of Brown Noise
  private createBrownNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('No context')
    const bufferSize = this.ctx.sampleRate * 10
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let lastOut = 0.0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      data[i] = (lastOut + 0.02 * white) / 1.02
      lastOut = data[i]
      data[i] *= 3.5
    }
    return buffer
  }

  // Generate Rain Buffer (10 seconds)
  private createRainBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('No context')
    const bufferSize = this.ctx.sampleRate * 10
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let lastOut = 0.0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      const brown = (lastOut + 0.015 * white) / 1.015
      lastOut = brown

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

  public async play(type: AmbientSoundType) {
    const ready = await this.ensureContext()
    if (!ready || !this.ctx || !this.gainNode) return

    this.cleanupNodes()
    this.currentType = type

    if (type === 'none' || type === 'metronome') {
      return
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

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(type === 'rain' ? 1400 : 750, this.ctx.currentTime)

      source.connect(filter)
      filter.connect(this.gainNode)

      source.start(0)
      this.noiseNode = source
      this.filterNode = filter
    } catch (e) {
      console.error('Failed to play synthesized soundscape:', e)
    }
  }

  public stop() {
    this.cleanupNodes()
    this.currentType = 'none'
  }

  // Play a soft click sound for the metronome
  public async playTick() {
    const ready = await this.ensureContext()
    if (!ready || !this.ctx || !this.gainNode || this.currentType !== 'metronome') return

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
  public async playSessionChime(isBreak: boolean) {
    const ready = await this.ensureContext()
    if (!ready || !this.ctx || !this.gainNode) return

    try {
      const now = this.ctx.currentTime
      const notes = isBreak ? [392, 523, 659] : [659, 523, 392]

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
