import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import ThemePreview from './ThemePreview'
import type { Theme, TimerConfig } from '../types'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  sessions: number
  onConfigChange: (config: Partial<TimerConfig>) => void
}

type SettingsTab = 'themes' | 'timers' | 'about'

const themeList: { name: Theme; label: string; description: string }[] = [
  { name: 'dark', label: 'Dark', description: 'Premium dark theme' },
  { name: 'stone', label: 'Stone', description: 'Warm neutral tones' },
  { name: 'amoled', label: 'AMOLED Black', description: 'Pure black optimized' },
  { name: 'neon', label: 'Neon Cyber', description: 'Purple neon glow' },
  { name: 'ocean', label: 'Ocean Glass', description: 'Blue glassmorphism' },
  { name: 'forest', label: 'Forest Calm', description: 'Natural green tones' },
  { name: 'sunset', label: 'Sunset Glow', description: 'Warm orange gradient' },
  { name: 'paper', label: 'Minimal Paper', description: 'Soft off-white clean' },
]

const tabs: { value: SettingsTab; label: string }[] = [
  { value: 'themes', label: 'Themes' },
  { value: 'timers', label: 'Timers' },
  { value: 'about', label: 'About' },
]

export default function SettingsModal({
  isOpen,
  onClose,
  sessions,
  onConfigChange,
}: SettingsModalProps) {
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<SettingsTab>('themes')

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--overlay)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-theme-lg animate-scale-in"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 px-6 py-3"
          style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-secondary)' }}
        >
          {tabs.map(tab => {
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'themes' && (
            <div>
              <h3 className="text-base font-semibold mb-1">Choose Theme</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>
                Select a theme to customize the look and feel.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {themeList.map(t => (
                  <ThemePreview
                    key={t.name}
                    theme={t.name}
                    label={t.label}
                    description={t.description}
                    isActive={theme === t.name}
                    onClick={() => setTheme(t.name)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timers' && (
            <div>
              <h3 className="text-base font-semibold mb-1">Timer Durations</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>
                Customize your focus and break durations.
              </p>
              <div className="space-y-3">
                {([
                  { key: 'focus' as const, label: 'Focus Session', defaultValue: 25 },
                  { key: 'break' as const, label: 'Short Break', defaultValue: 5 },
                  { key: 'longBreak' as const, label: 'Long Break', defaultValue: 15 },
                ]).map(item => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{
                      backgroundColor: 'var(--glass-bg)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <label className="text-sm font-medium">{item.label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={120}
                        defaultValue={item.defaultValue}
                        onChange={e => {
                          const val = parseInt(e.target.value, 10)
                          if (val > 0) {
                            onConfigChange({ [item.key]: val * 60 })
                          }
                        }}
                        className="w-20 px-3 py-1.5 rounded-lg text-sm text-center outline-none"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      />
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>min</span>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-6 p-4 rounded-xl"
                style={{
                  backgroundColor: 'var(--glass-bg)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div className="text-sm font-medium mb-1">Session History</div>
                <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  Total focus sessions completed: <strong style={{ color: 'var(--text-primary)' }}>{sessions}</strong>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div>
              <h3 className="text-base font-semibold mb-1">About Pomito</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>
                A premium Pomodoro productivity app.
              </p>
              <div
                className="p-4 rounded-xl space-y-2"
                style={{
                  backgroundColor: 'var(--glass-bg)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Version</span>
                  <span className="text-sm font-medium">1.0.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Framework</span>
                  <span className="text-sm font-medium">React + TypeScript</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Styling</span>
                  <span className="text-sm font-medium">Tailwind CSS</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
