export type Theme =
  | 'dark'
  | 'stone'
  | 'amoled'
  | 'neon'
  | 'ocean'
  | 'forest'
  | 'sunset'
  | 'paper'

export type TimerMode = 'focus' | 'break' | 'longBreak'

export type TimerStatus = 'idle' | 'running' | 'paused'

export interface TimerConfig {
  focus: number
  break: number
  longBreak: number
}

export interface ThemeConfig {
  name: Theme
  label: string
  description: string
}

export interface Task {
  id: string
  title: string
  completed: boolean
  pomodoroCount: number
  estimatedPomodoros: number
}

export type AmbientSoundType = 'none' | 'white-noise' | 'brown-noise' | 'rain' | 'metronome'

