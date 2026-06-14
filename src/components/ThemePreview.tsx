import type { Theme } from '../types'

interface ThemePreviewProps {
  theme: Theme
  label: string
  description: string
  isActive: boolean
  onClick: () => void
}

const previewColors: Record<Theme, { bg: string; card: string; accent: string; text: string }> = {
  dark: { bg: '#1a1919', card: '#222222', accent: '#f2f2f2', text: '#ffffff' },
  stone: { bg: '#f3f0e7', card: '#ffffff', accent: '#1a1919', text: '#1a1919' },
  amoled: { bg: '#000000', card: '#0a0a0a', accent: '#ffffff', text: '#ffffff' },
  neon: { bg: '#0d0221', card: '#1a053d', accent: '#c084fc', text: '#ffffff' },
  ocean: { bg: '#0c1445', card: 'rgba(255,255,255,0.08)', accent: '#60a5fa', text: '#ffffff' },
  forest: { bg: '#0f2a1e', card: '#1a4a32', accent: '#4ade80', text: '#ffffff' },
  sunset: { bg: '#1c0f10', card: '#3d1c22', accent: '#fb923c', text: '#ffffff' },
  paper: { bg: '#fafaf9', card: '#ffffff', accent: '#292524', text: '#1c1917' },
}

export default function ThemePreview({ theme, label, description, isActive, onClick }: ThemePreviewProps) {
  const colors = previewColors[theme]

  return (
    <button
      onClick={onClick}
      className="relative w-full text-left rounded-xl overflow-hidden transition-all duration-200 active:scale-[0.98]"
      style={{
        border: isActive ? '2px solid var(--accent)' : '2px solid var(--border-subtle)',
        boxShadow: isActive ? '0 0 20px var(--glow-color)' : 'none',
      }}
    >
      {/* Mini Preview */}
      <div
        className="p-3"
        style={{ backgroundColor: colors.bg }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-bold"
            style={{ backgroundColor: colors.accent, color: colors.bg }}
          >
            P
          </div>
          <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: colors.card }} />
        </div>
        <div className="flex items-center justify-center mb-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ border: `2px solid ${colors.accent}`, borderTopColor: 'transparent' }}
          />
        </div>
        <div className="flex justify-center gap-1">
          <div
            className="w-6 h-2 rounded-sm"
            style={{ backgroundColor: colors.accent }}
          />
          <div
            className="w-6 h-2 rounded-sm opacity-40"
            style={{ backgroundColor: colors.card }}
          />
        </div>
      </div>

      {/* Label */}
      <div
        className="px-3 py-2"
        style={{
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{description}</div>
      </div>
    </button>
  )
}
