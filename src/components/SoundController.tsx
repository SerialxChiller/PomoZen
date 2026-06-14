import type { AmbientSoundType } from '../types'

interface SoundControllerProps {
  currentSound: AmbientSoundType
  volume: number
  onSoundChange: (sound: AmbientSoundType) => void
  onVolumeChange: (vol: number) => void
}

const sounds: { value: AmbientSoundType; label: string; icon: string }[] = [
  { value: 'none', label: 'Silent', icon: '🔇' },
  { value: 'rain', label: 'Rainstorm', icon: '🌧️' },
  { value: 'brown-noise', label: 'Brown Noise', icon: '🟤' },
  { value: 'white-noise', label: 'White Noise', icon: '⚪' },
  { value: 'metronome', label: 'Metronome', icon: '⏱️' },
]

export default function SoundController({
  currentSound,
  volume,
  onSoundChange,
  onVolumeChange,
}: SoundControllerProps) {
  return (
    <div
      className="w-full max-w-md p-6 rounded-2xl glass flex flex-col gap-4 animate-scale-in"
      style={{
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <h3 className="text-sm font-bold flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
          Focus Soundscapes
        </h3>
        {currentSound !== 'none' && (
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold select-none animate-pulse bg-green-500 bg-opacity-20 text-green-400">
            PLAYING
          </span>
        )}
      </div>

      {/* Grid of Soundscapes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {sounds.map(sound => {
          const isActive = currentSound === sound.value
          return (
            <button
              key={sound.value}
              onClick={() => onSoundChange(sound.value)}
              className="flex flex-col items-center justify-center p-3.5 rounded-xl transition-all duration-200 active:scale-[0.96] hover:bg-opacity-50"
              style={{
                backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-card)',
                color: isActive ? 'var(--accent-text)' : 'var(--text-primary)',
                border: isActive ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
              }}
            >
              <span className="text-xl mb-1">{sound.icon}</span>
              <span className="text-[10px] font-bold tracking-tight">{sound.label}</span>
            </button>
          )
        })}
      </div>

      {/* Volume slider */}
      {currentSound !== 'none' && (
        <div className="flex flex-col gap-1.5 mt-2 animate-fade-in">
          <div className="flex justify-between text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <span>Sound Volume</span>
            <span>{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={e => onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1 rounded-lg appearance-none cursor-pointer outline-none"
            style={{
              background: 'var(--bg-secondary)',
            }}
          />
        </div>
      )}
    </div>
  )
}
