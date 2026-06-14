import type { TimerMode } from '../types'

interface ModeToggleProps {
  mode: TimerMode
  onModeChange: (mode: TimerMode) => void
}

const modes: { value: TimerMode; label: string }[] = [
  { value: 'focus', label: 'Deep Work' },
  { value: 'break', label: 'Break Time' },
  { value: 'longBreak', label: 'Long Break' },
]

export default function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl glass" style={{ border: '1px solid var(--border-subtle)' }}>
      {modes.map(m => {
        const isActive = mode === m.value
        return (
          <button
            key={m.value}
            onClick={() => onModeChange(m.value)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95"
            style={{
              backgroundColor: isActive ? 'var(--btn-bg)' : 'transparent',
              color: isActive ? 'var(--btn-text)' : 'var(--text-secondary)',
            }}
            onMouseEnter={e => {
              if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
            }}
            onMouseLeave={e => {
              if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
            }}
          >
            {m.label}
          </button>
        )
      })}
    </div>
  )
}
