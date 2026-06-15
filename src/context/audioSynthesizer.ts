import type { AmbientSoundType } from '../types'

class AudioSynthManager {
  private ctx: AudioContext | null = null
  private noiseNode: AudioBufferSourceNode | null = null
  private gainNode: GainNode | null = null
  private filterNode: BiquadFilterNode | null = null
  private currentType: AmbientSoundType = 'none'
  private volume: number = 0.3
  private unlocked: boolean = false

  constructor() {
    this.initAudioSession()
    this.setupAudioSessionCapture()
    this.createContextEarly()
    this.setupAutoUnlock()
  }

  private initAudioSession() {
    try {
      if ((navigator as any).audioSession) {
        (navigator as any).audioSession.type = 'playback'
      }
    } catch {
      // audioSession API not available
    }
  }

  private setupAudioSessionCapture() {
    const setPlayback = () => {
      try {
        if ((navigator as any).audioSession) {
          (navigator as any).audioSession.type = 'playback'
        }
      } catch {
        // silent
      }
    }

    try {
      document.addEventListener('click', setPlayback, { capture: true, once: true } as AddEventListenerOptions)
      document.addEventListener('touchstart', setPlayback, { capture: true, once: true } as AddEventListenerOptions)
      document.addEventListener('pointerdown', setPlayback, { capture: true, once: true } as AddEventListenerOptions)
    } catch {
      // failed to attach capture-phase listeners
    }
  }

  private createContextEarly() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      this.ctx = new AudioCtx()
      this.gainNode = this.ctx.createGain()
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime)
      this.gainNode.connect(this.ctx.destination)
    } catch {
      // eager ctx create failed
    }
  }

  private setupAutoUnlock() {
    const tryUnlock = () => {
      document.removeEventListener('click', tryUnlock)
      document.removeEventListener('touchstart', tryUnlock)
      document.removeEventListener('keydown', tryUnlock)

      if (this.unlocked) return
      this.unlocked = true

      if (!this.ctx) {
        this.createContextEarly()
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume()
      }

      if (this.ctx && this.gainNode) {
        try {
          const osc = this.ctx.createOscillator()
          const g = this.ctx.createGain()
          g.gain.value = 0.001
          osc.type = 'sine'
          osc.frequency.value = 440
          osc.connect(g)
          g.connect(this.gainNode)
          osc.start()
          osc.stop(this.ctx.currentTime + 0.01)
        } catch {
          // priming failed
        }
      }
    }

    try {
      document.addEventListener('click', tryUnlock, { once: true })
      document.addEventListener('touchstart', tryUnlock, { once: true })
      document.addEventListener('keydown', tryUnlock, { once: true })
    } catch {
      // auto-unlock setup failed
    }
  }

  private async ensureContext(): Promise<boolean> {
    if (this.ctx && this.ctx.state === 'closed') {
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
      } catch {
        return false
      }
    }

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume()
      } catch {
        return false
      }
    }

    return this.ctx !== null
  }

  private cleanupNodes() {
    if (this.noiseNode) {
      try { this.noiseNode.stop() } catch { }
      try { this.noiseNode.disconnect() } catch { }
      this.noiseNode = null
    }
    if (this.filterNode) {
      try { this.filterNode.disconnect() } catch { }
      this.filterNode = null
    }
  }

  public async resumeContext(): Promise<boolean> {
    return this.ensureContext()
  }

  public initContextSync(): boolean {
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
      } catch {
        return false
      }
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }

    return this.ctx !== null
  }

  public playSync(type: AmbientSoundType): boolean {
    this.cleanupNodes()
    this.currentType = type

    if (type === 'none' || type === 'metronome') {
      return true
    }

    if (!this.ctx || !this.gainNode) {
      return false
    }

    try {
      let buffer: AudioBuffer
      if (type === 'white-noise') {
        buffer = this.createWhiteNoiseBuffer()
      } else if (type === 'brown-noise') {
        buffer = this.createBrownNoiseBuffer()
      } else if (type === 'rain') {
        buffer = this.createRainBuffer()
      } else {
        return false
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
      return true
    } catch {
      return false
    }
  }

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
    if (!ready || !this.ctx || !this.gainNode) {
      return
    }

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
    } catch {
      // play error
    }
  }

  public stop() {
    this.cleanupNodes()
    this.currentType = 'none'
  }

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
    } catch {
      // Audio node error
    }
  }

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
    } catch {
      // Audio issue
    }
  }
}

export const audioSynth = new AudioSynthManager()
