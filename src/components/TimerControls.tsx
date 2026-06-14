import type { TimerStatus } from '../types'

interface TimerControlsProps {
  status: TimerStatus
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onSkip: () => void
}

export default function TimerControls({
  status,
  onStart,
  onPause,
  onResume,
  onReset,
  onSkip,
}: TimerControlsProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main Play/Pause Button */}
      <button
        onClick={status === 'running' ? onPause : status === 'paused' ? onResume : onStart}
        className="w-64 h-16 rounded-xl flex items-center justify-center transition-all active:scale-[0.98] hover:opacity-90 shadow-theme"
        style={{
          backgroundColor: 'var(--btn-bg)',
          color: 'var(--btn-text)',
        }}
      >
        {status === 'running' ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
        <span className="ml-3 font-medium text-base">
          {status === 'running' ? 'Pause' : status === 'paused' ? 'Resume' : 'Start Focus'}
        </span>
      </button>

      {/* Secondary Controls */}
      <div className="flex items-center gap-3">
        {(status === 'running' || status === 'paused') && (
          <button
            onClick={onReset}
            className="p-2.5 rounded-lg transition-all duration-300 hover:rotate-180 active:scale-90"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        )}
        {(status === 'idle' || status === 'paused') && (
          <button
            onClick={onSkip}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 glass"
            style={{
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-card)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--glass-bg)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
            }}
          >
            {status === 'idle' ? 'Skip to Break' : 'Skip'}
          </button>
        )}
      </div>
    </div>
  )
}
