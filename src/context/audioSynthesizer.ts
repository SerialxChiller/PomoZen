import type { AmbientSoundType } from '../types'

interface DiagnosticState {
  ctxCreated: number
  ctxResumed: number
  ctxFailed: number
  nodesCreated: number
  nodesStarted: number
  nodesFailed: number
  beepAttempted: number
  beepSucceeded: number
  beepFailed: number
  lastError: string | null
  lastOperation: string | null
  log: string[]
}

class AudioSynthManager {
  private ctx: AudioContext | null = null
  private noiseNode: AudioBufferSourceNode | null = null
  private gainNode: GainNode | null = null
  private filterNode: BiquadFilterNode | null = null
  private currentType: AmbientSoundType = 'none'
  private volume: number = 0.3

  public diag: DiagnosticState = {
    ctxCreated: 0,
    ctxResumed: 0,
    ctxFailed: 0,
    nodesCreated: 0,
    nodesStarted: 0,
    nodesFailed: 0,
    beepAttempted: 0,
    beepSucceeded: 0,
    beepFailed: 0,
    lastError: null,
    lastOperation: null,
    log: [],
  }

  constructor() {
    // Lazy initialize when user interacts
  }

  private log(msg: string) {
    this.diag.log.push(`[${Date.now()}] ${msg}`)
    if (this.diag.log.length > 100) this.diag.log.shift()
  }

  private async ensureContext(): Promise<boolean> {
    this.diag.lastOperation = 'ensureContext'
    if (this.ctx?.state === 'closed') {
      this.log('ctx closed, cleaning up')
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
        this.diag.ctxCreated++
        this.log('AudioContext created')
      } catch (e) {
        this.diag.ctxFailed++
        this.diag.lastError = String(e)
        this.log(`ctx create failed: ${e}`)
        return false
      }
    }

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume()
        this.diag.ctxResumed++
        this.log('AudioContext resumed')
      } catch (e) {
        this.diag.lastError = String(e)
        this.log(`ctx resume failed: ${e}`)
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

  // Synchronous context initialization — MUST be called within user gesture
  public initContextSync(): boolean {
    this.diag.lastOperation = 'initContextSync'
    this.log('initContextSync called')

    if (this.ctx?.state === 'closed') {
      this.log('ctx closed, re-creating')
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
        this.diag.ctxCreated++
        this.log('AudioContext created (sync)')
      } catch (e) {
        this.diag.ctxFailed++
        this.diag.lastError = String(e)
        this.log(`ctx create failed (sync): ${e}`)
        return false
      }
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
      this.diag.ctxResumed++
      this.log('ctx.resume() called (sync)')
    }

    this.log(`ctx state after initContextSync: ${this.ctx.state}`)
    return this.ctx !== null
  }

  // Synchronous playback — ALL node creation happens in one synchronous block
  // This is critical for iOS WebKit which requires nodes to be created within user gesture
  public playSync(type: AmbientSoundType): boolean {
    this.diag.lastOperation = `playSync(${type})`
    this.log(`playSync(${type}) called`)

    this.cleanupNodes()
    this.currentType = type

    if (type === 'none' || type === 'metronome') {
      this.log(`playSync: ${type} — no background sound needed`)
      return true
    }

    if (!this.ctx || !this.gainNode) {
      this.diag.lastError = 'No AudioContext'
      this.log('playSync failed: no ctx')
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
        this.log(`playSync: unknown type ${type}`)
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
      this.diag.nodesCreated++
      this.diag.nodesStarted++
      this.log(`playSync(${type}): nodes created and started successfully`)
      return true
    } catch (e) {
      this.diag.nodesFailed++
      this.diag.lastError = String(e)
      this.log(`playSync error: ${e}`)
      return false
    }
  }

  // Generate 10 seconds of White Noise
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
    this.diag.lastOperation = `play(${type})`
    this.log(`play(${type}) called`)
    const ready = await this.ensureContext()
    if (!ready || !this.ctx || !this.gainNode) {
      this.log('play aborted: ctx not ready')
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
      this.diag.nodesCreated++
      this.diag.nodesStarted++
      this.log(`play(${type}): nodes created and started`)
    } catch (e) {
      this.diag.nodesFailed++
      this.diag.lastError = String(e)
      this.log(`play error: ${e}`)
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
    } catch (e) {
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
    } catch (e) {
      // Audio issue
    }
  }

  // Diagnostic test: play a simple 440Hz tone for 1 second
  public testBeep(): { success: boolean; ctxState: string; error?: string; details: string[] } {
    this.diag.beepAttempted++
    this.diag.lastOperation = 'testBeep'
    const details: string[] = []

    details.push(`ctx exists: ${!!this.ctx}`)
    details.push(`ctx state: ${this.ctx?.state ?? 'null'}`)
    details.push(`gainNode exists: ${!!this.gainNode}`)
    this.log(`testBeep: ctx exists=${!!this.ctx}, state=${this.ctx?.state}`)

    if (!this.ctx || !this.gainNode) {
      const inited = this.initContextSync()
      details.push(`initContextSync result: ${inited}`)
      details.push(`ctx state after init: ${this.ctx?.state ?? 'null'}`)
      this.log(`testBeep: initContextSync returned ${inited}, state=${this.ctx?.state}`)
    }

    if (!this.ctx || !this.gainNode) {
      this.diag.beepFailed++
      this.diag.lastError = 'Failed to init AudioContext'
      details.push('FAIL: no ctx available')
      this.log('testBeep: no ctx after init')
      return { success: false, ctxState: 'null', error: 'Failed to init AudioContext', details }
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
      details.push('ctx.resume() called')
      this.log('testBeep: ctx was suspended, resume() called')
    }

    try {
      const osc = this.ctx.createOscillator()
      details.push('oscillator created')
      const gain = this.ctx.createGain()
      details.push('gain created')

      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, this.ctx.currentTime)

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1)

      osc.connect(gain)
      gain.connect(this.gainNode)
      details.push('nodes connected')

      osc.start()
      details.push('osc.start() called')
      osc.stop(this.ctx.currentTime + 1)
      details.push('osc.stop() called')

      this.diag.beepSucceeded++
      details.push('BEEP: SUCCESS')
      this.log('testBeep: SUCCESS')
      return { success: true, ctxState: this.ctx.state, details }
    } catch (e) {
      this.diag.beepFailed++
      this.diag.lastError = String(e)
      details.push(`ERROR: ${e}`)
      this.log(`testBeep: ERROR: ${e}`)
      return { success: false, ctxState: this.ctx?.state ?? 'null', error: String(e), details }
    }
  }
}

export const audioSynth = new AudioSynthManager()
