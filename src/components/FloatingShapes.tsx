import { useTheme } from '../context/ThemeContext'

const shapeConfigs: Record<string, { count: number; size: string; opacity: string }> = {
  dark: { count: 4, size: '200px', opacity: '0.03' },
  stone: { count: 4, size: '200px', opacity: '0.04' },
  amoled: { count: 3, size: '180px', opacity: '0.02' },
  neon: { count: 5, size: '220px', opacity: '0.08' },
  ocean: { count: 5, size: '220px', opacity: '0.08' },
  forest: { count: 4, size: '200px', opacity: '0.06' },
  sunset: { count: 4, size: '200px', opacity: '0.06' },
  paper: { count: 3, size: '180px', opacity: '0.04' },
}

export default function FloatingShapes() {
  const { theme } = useTheme()
  const cfg = shapeConfigs[theme] ?? shapeConfigs.dark

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: cfg.count }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: cfg.size,
            height: cfg.size,
            opacity: cfg.opacity,
            backgroundColor: 'var(--accent)',
            top: `${20 + i * 18}%`,
            left: `${10 + i * 22}%`,
            animation: `float ${6 + i * 2}s ease-in-out ${i * 2}s infinite`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      {Array.from({ length: Math.max(1, cfg.count - 1) }).map((_, i) => (
        <div
          key={`shape-${i}`}
          className="absolute rounded-full"
          style={{
            width: `calc(${cfg.size} * 0.6)`,
            height: `calc(${cfg.size} * 0.6)`,
            opacity: cfg.opacity,
            backgroundColor: 'var(--accent)',
            top: `${40 + i * 25}%`,
            right: `${15 + i * 20}%`,
            animation: `float ${8 + i * 2}s ease-in-out ${i * 3}s infinite`,
            transform: 'translate(50%, -50%)',
          }}
        />
      ))}
    </div>
  )
}
