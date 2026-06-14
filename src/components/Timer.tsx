import { useState, useEffect } from 'react'

interface TimerProps {
  timeLeft: number
  totalTime: number
  status: string
  mode: string
  activeTaskTitle?: string
}

const CIRCUMFERENCE = 2 * Math.PI * 120

const focusMessages = [
  'Stay in the flow',
  'Deep focus mode',
  'You got this',
  'One session at a time',
  'Progress over perfection',
  'Every second counts',
  'Be present',
]

const breakMessages = [
  'Take a breather',
  'Rest and recharge',
  'Nice work so far',
  'You deserve this break',
  'Refresh your mind',
  'Stretch a little',
]

const longBreakMessages = [
  'Long break — well deserved',
  'Reset and recharge fully',
  'Take your time',
  'You\'ve earned this rest',
]

export default function Timer({ timeLeft, totalTime, status, mode, activeTaskTitle }: TimerProps) {
  const [messageIndex, setMessageIndex] = useState(0)

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  const visualProgress = totalTime > 0 ? timeLeft / totalTime : 1
  const dashOffset = CIRCUMFERENCE * (1 - visualProgress)

  const messages = mode === 'focus'
    ? focusMessages
    : mode === 'longBreak'
      ? longBreakMessages
      : breakMessages

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [messages.length])

  useEffect(() => {
    setMessageIndex(0)
  }, [mode])

  // Update HTML document title dynamically to display remaining time
  useEffect(() => {
    const modeLabel = mode === 'focus' ? 'Focus' : 'Break'
    document.title = `${display} | PomoZen — ${modeLabel}`
    return () => {
      document.title = 'PomoZen — Premium Pomodoro'
    }
  }, [display, mode])

  return (
    <div className={`relative flex flex-col items-center transition-all duration-500 animate-scale-in ${status === 'running' ? 'animate-breath' : ''}`}>
      {/* Progress Ring */}
      <div className="relative w-72 h-72 md:w-80 md:h-80">
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 300 300"
          fill="none"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="timer-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--ring-grad-start, var(--accent))" />
              <stop offset="100%" stopColor="var(--ring-grad-end, var(--accent-hover))" />
            </linearGradient>
          </defs>

          {/* Underlay / Track Circle */}
          <circle
            cx="150"
            cy="150"
            r="120"
            stroke="var(--ring-track)"
            strokeWidth="5"
            opacity="0.8"
          />

          {/* Glowing background ring (when running) */}
          {status === 'running' && (
            <circle
              cx="150"
              cy="150"
              r="120"
              stroke="url(#timer-ring-gradient)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{
                transition: 'stroke-dashoffset 0.35s linear',
                opacity: 0.3,
                filter: 'blur(6px)',
              }}
            />
          )}

          {/* Main Progress Ring */}
          <circle
            cx="150"
            cy="150"
            r="120"
            stroke="url(#timer-ring-gradient)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 0.35s linear',
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <span
            className="text-[10px] md:text-xs uppercase tracking-widest font-extrabold select-none opacity-50"
            style={{ color: 'var(--text-secondary)' }}
          >
            {mode === 'focus' ? 'Focus Session' : mode === 'longBreak' ? 'Long Break' : 'Short Break'}
          </span>
          <span
            className="text-6xl md:text-7.5xl font-black tracking-tight tabular-nums select-none mt-1 font-sans"
            style={{ color: 'var(--text-primary)' }}
          >
            {display}
          </span>
          <span
            className="text-xs mt-2 transition-opacity duration-500 h-4 max-w-[200px] truncate"
            style={{ color: 'var(--text-secondary)' }}
          >
            {messages[messageIndex]}
          </span>
          
          {activeTaskTitle ? (
            <div 
              className="flex items-center gap-1.5 mt-4 max-w-[180px] px-3 py-1 rounded-full text-[10px] font-semibold glass text-ellipsis overflow-hidden whitespace-nowrap animate-fade-in" 
              style={{ border: '1px solid var(--border-subtle)', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="truncate" style={{ color: 'var(--text-primary)' }}>{activeTaskTitle}</span>
            </div>
          ) : (
            <span
              className="text-[10px] mt-4 italic opacity-40"
              style={{ color: 'var(--text-tertiary)' }}
            >
              No active task
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
