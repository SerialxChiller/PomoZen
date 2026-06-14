import { useState, useEffect, useRef } from 'react'
import { useTimer } from './hooks/useTimer'
import Header from './components/Header'
import ModeToggle from './components/ModeToggle'
import Timer from './components/Timer'
import TimerControls from './components/TimerControls'
import StatsCard from './components/StatsCard'
import SettingsModal from './components/SettingsModal'
import FloatingShapes from './components/FloatingShapes'
import TaskList from './components/TaskList'
import SoundController from './components/SoundController'
import { audioSynth } from './context/audioSynthesizer'
import type { Task, AmbientSoundType } from './types'

const LOCAL_STORAGE_TASKS_KEY = 'pomito-tasks'
const LOCAL_STORAGE_ACTIVE_TASK_KEY = 'pomito-active-task-id'

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const {
    timeLeft,
    totalTime,
    status,
    mode,
    sessions,
    start,
    pause,
    resume,
    reset,
    skip,
    setMode,
    updateConfig,
  } = useTimer()

  // Task checklist state
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY)
    return stored ? JSON.parse(stored) : []
  })

  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    return localStorage.getItem(LOCAL_STORAGE_ACTIVE_TASK_KEY)
  })

  // Soundscape state
  const [currentSound, setCurrentSound] = useState<AmbientSoundType>('none')
  const [volume, setVolume] = useState<number>(0.35)

  // Save tasks and active task to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    if (activeTaskId) {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_TASK_KEY, activeTaskId)
    } else {
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_TASK_KEY)
    }
  }, [activeTaskId])

  // Track session increments to update active task pomodoros & play chimes
  const prevSessionsRef = useRef(sessions)
  useEffect(() => {
    if (sessions > prevSessionsRef.current) {
      // Focus session completed! Increment pomos on active task if any
      if (activeTaskId) {
        setTasks(prev => 
          prev.map(t => t.id === activeTaskId ? { ...t, pomodoroCount: t.pomodoroCount + 1 } : t)
        )
      }
      audioSynth.playSessionChime(false) // Play focus finished chime
    }
    prevSessionsRef.current = sessions
  }, [sessions, activeTaskId])

  // Track mode changes to play break-finished chimes
  const prevModeRef = useRef(mode)
  useEffect(() => {
    if (prevModeRef.current !== 'focus' && mode === 'focus') {
      audioSynth.playSessionChime(true) // Play break finished chime
    }
    prevModeRef.current = mode
  }, [mode])

  // Sync ambient sound volume
  useEffect(() => {
    audioSynth.setVolume(volume)
  }, [volume])

  // Sync ambient sound playing status
  useEffect(() => {
    if (status === 'running') {
      audioSynth.play(currentSound)
    } else {
      audioSynth.stop()
    }
    return () => {
      audioSynth.stop()
    }
  }, [currentSound, status])

  // Play metronome clicks synchronizing with second transitions
  useEffect(() => {
    if (status === 'running' && currentSound === 'metronome') {
      audioSynth.playTick()
    }
  }, [timeLeft, status, currentSound])

  // Handlers for Checklist operations
  const handleAddTask = (title: string, estimatedPomodoros: number) => {
    const newTask: Task = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      title,
      completed: false,
      pomodoroCount: 0,
      estimatedPomodoros,
    }
    setTasks(prev => [...prev, newTask])
  }

  const handleToggleComplete = (id: string) => {
    setTasks(prev => 
      prev.map(t => {
        if (t.id === id) {
          const nextCompleted = !t.completed
          // If the task gets completed, deactivate it if active
          if (nextCompleted && activeTaskId === id) {
            setActiveTaskId(null)
          }
          return { ...t, completed: nextCompleted }
        }
        return t
      })
    )
  }

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    if (activeTaskId === id) {
      setActiveTaskId(null)
    }
  }

  const handleSetActiveTask = (id: string | null) => {
    setActiveTaskId(id)
  }

  // Find active task object
  const activeTask = tasks.find(t => t.id === activeTaskId)

  return (
    <div className="relative min-h-screen flex flex-col">
      <FloatingShapes />

      <Header onOpenSettings={() => setSettingsOpen(true)} />

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center px-4 lg:px-8 py-6 gap-8 max-w-6xl mx-auto w-full">
        {/* Left Side: Timer Focus Area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-lg">
          <ModeToggle mode={mode} onModeChange={setMode} />

          <Timer
            timeLeft={timeLeft}
            totalTime={totalTime}
            status={status}
            mode={mode}
            activeTaskTitle={activeTask?.title}
          />

          <TimerControls
            status={status}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onReset={reset}
            onSkip={skip}
          />

          <StatsCard sessions={sessions} />
        </div>

        {/* Right Side: Checklist and Soundscapes widgets */}
        <div className="flex flex-col gap-6 w-full max-w-md">
          <TaskList
            tasks={tasks}
            activeTaskId={activeTaskId}
            onAddTask={handleAddTask}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
            onSetActiveTask={handleSetActiveTask}
          />

          <SoundController
            currentSound={currentSound}
            volume={volume}
            onSoundChange={setCurrentSound}
            onVolumeChange={setVolume}
          />
        </div>
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        sessions={sessions}
        onConfigChange={updateConfig}
      />
    </div>
  )
}

export default App
