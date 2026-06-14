interface StatsCardProps {
  sessions: number
  streak?: number
}

export default function StatsCard({ sessions, streak = 0 }: StatsCardProps) {
  return (
    <div
      className="flex items-center gap-6 px-6 py-3 rounded-xl animate-fade-in"
      style={{
        backgroundColor: 'var(--glass-bg)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'var(--glass-bg)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Sessions</div>
          <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{sessions}</div>
        </div>
      </div>

      <div className="w-px h-8" style={{ backgroundColor: 'var(--border-subtle)' }} />

      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'var(--glass-bg)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Streak</div>
          <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{streak}</div>
        </div>
      </div>
    </div>
  )
}
