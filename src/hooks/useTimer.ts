import { useState, useRef, useEffect, useCallback } from 'react'
import type { TimerMode, TimerStatus, TimerConfig } from '../types'

interface UseTimerReturn {
  timeLeft: number
  totalTime: number
  status: TimerStatus
  mode: TimerMode
  sessions: number
  progress: number
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  skip: () => void
  setMode: (mode: TimerMode) => void
  setCustomTime: (mode: TimerMode, seconds: number) => void
  updateConfig: (config: Partial<TimerConfig>) => void
}

const DEFAULT_CONFIG: TimerConfig = {
  focus: 25 * 60,
  break: 5 * 60,
  longBreak: 15 * 60,
}

function playNotification() {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, audio.currentTime)
    gain.gain.setValueAtTime(0.3, audio.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.5)
    osc.connect(gain)
    gain.connect(audio.destination)
    osc.start(audio.currentTime)
    osc.stop(audio.currentTime + 0.5)

    const osc2 = audio.createOscillator()
    const gain2 = audio.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1100, audio.currentTime + 0.15)
    gain2.gain.setValueAtTime(0.3, audio.currentTime + 0.15)
    gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.65)
    osc2.connect(gain2)
    gain2.connect(audio.destination)
    osc2.start(audio.currentTime + 0.15)
    osc2.stop(audio.currentTime + 0.65)
  } catch {
    // Audio not supported
  }
}

export function useTimer(initialConfig?: Partial<TimerConfig>): UseTimerReturn {
  const [config, setConfig] = useState<TimerConfig>({ ...DEFAULT_CONFIG, ...initialConfig })
  const [mode, setModeState] = useState<TimerMode>('focus')
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [timeLeft, setTimeLeft] = useState(config.focus)
  const [sessions, setSessions] = useState(0)

  const endTimeRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const modeRef = useRef(mode)
  const sessionsRef = useRef(sessions)
  const configRef = useRef(config)

  modeRef.current = mode
  sessionsRef.current = sessions
  configRef.current = config

  const totalTime = config[mode]
  const progress = totalTime > 0 ? 1 - timeLeft / totalTime : 0

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    endTimeRef.current = null
  }, [])

  const startNextMode = useCallback((currentMode: TimerMode, currentSessions: number) => {
    const cfg = configRef.current
    if (currentMode === 'focus') {
      const nextSessions = currentSessions + 1
      setSessions(nextSessions)
      const nextMode: TimerMode = nextSessions % 4 === 0 ? 'longBreak' : 'break'
      setModeState(nextMode)
      setTimeLeft(cfg[nextMode])
    } else {
      setModeState('focus')
      setTimeLeft(cfg.focus)
    }
  }, [])

  const tick = useCallback(() => {
    if (endTimeRef.current === null) return
    const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000))
    setTimeLeft(remaining)

    if (remaining <= 0) {
      clearTimer()
      setStatus('idle')
      playNotification()
      startNextMode(modeRef.current, sessionsRef.current)
    }
  }, [clearTimer, startNextMode])

  const start = useCallback(() => {
    if (status === 'idle') {
      endTimeRef.current = Date.now() + timeLeft * 1000
      setStatus('running')
      intervalRef.current = setInterval(tick, 100)
    }
  }, [status, timeLeft, tick])

  const pause = useCallback(() => {
    if (status === 'running') {
      clearTimer()
      setStatus('paused')
    }
  }, [status, clearTimer])

  const resume = useCallback(() => {
    if (status === 'paused') {
      endTimeRef.current = Date.now() + timeLeft * 1000
      setStatus('running')
      intervalRef.current = setInterval(tick, 100)
    }
  }, [status, timeLeft, tick])

  const reset = useCallback(() => {
    clearTimer()
    setStatus('idle')
    setTimeLeft(configRef.current[modeRef.current])
  }, [clearTimer])

  const skip = useCallback(() => {
    clearTimer()
    setStatus('idle')
    playNotification()
    startNextMode(modeRef.current, sessionsRef.current)
  }, [clearTimer, startNextMode])

  const setMode = useCallback((m: TimerMode) => {
    clearTimer()
    setStatus('idle')
    setModeState(m)
    setTimeLeft(configRef.current[m])
  }, [clearTimer])

  const setCustomTime = useCallback((m: TimerMode, seconds: number) => {
    setConfig(prev => ({ ...prev, [m]: seconds }))
    if (m === modeRef.current) {
      setTimeLeft(seconds)
      if (status === 'idle') {
        clearTimer()
        setTimeLeft(seconds)
      }
    }
  }, [status, clearTimer])

  const updateConfig = useCallback((newConfig: Partial<TimerConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig }
      if (modeRef.current in updated) {
        setTimeLeft(updated[modeRef.current])
      }
      return updated
    })
  }, [])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  return {
    timeLeft,
    totalTime,
    status,
    mode,
    sessions,
    progress,
    start,
    pause,
    resume,
    reset,
    skip,
    setMode,
    setCustomTime,
    updateConfig,
  }
}
