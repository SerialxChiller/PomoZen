import { useState } from 'react'
import type { Task } from '../types'

interface TaskListProps {
  tasks: Task[]
  activeTaskId: string | null
  onAddTask: (title: string, estimatedPomodoros: number) => void
  onToggleComplete: (id: string) => void
  onDeleteTask: (id: string) => void
  onSetActiveTask: (id: string | null) => void
}

export default function TaskList({
  tasks,
  activeTaskId,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
  onSetActiveTask,
}: TaskListProps) {
  const [newTitle, setNewTitle] = useState('')
  const [estPomos, setEstPomos] = useState(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    onAddTask(newTitle.trim(), estPomos)
    setNewTitle('')
    setEstPomos(1)
  }

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
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          Focus Checklist
        </h3>
        <span className="text-xs px-2.5 py-0.5 rounded-full glass font-semibold" style={{ color: 'var(--text-secondary)' }}>
          {tasks.filter(t => t.completed).length}/{tasks.length} Done
        </span>
      </div>

      {/* Task input form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Add new task to focus on..."
            className="flex-1 px-4 py-2 rounded-xl text-sm outline-none transition-all"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          />
          <button
            type="submit"
            className="h-9 px-4 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-200 active:scale-95 hover:opacity-90"
            style={{
              backgroundColor: 'var(--btn-bg)',
              color: 'var(--btn-text)',
            }}
          >
            Add
          </button>
        </div>

        {/* Estimate controller */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Est. Pomodoros:</span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setEstPomos(val)}
                className="w-7 h-7 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all duration-150"
                style={{
                  backgroundColor: estPomos === val ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: estPomos === val ? 'var(--accent-text)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* Tasks listing */}
      <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <div className="text-center py-6 text-xs italic" style={{ color: 'var(--text-tertiary)' }}>
            No tasks yet. Create one above to start focusing!
          </div>
        ) : (
          tasks.map(task => {
            const isActive = activeTaskId === task.id
            return (
              <div
                key={task.id}
                onClick={() => !task.completed && onSetActiveTask(isActive ? null : task.id)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${isActive ? 'ring-1' : 'hover:bg-opacity-40'}`}
                style={{
                  backgroundColor: isActive ? 'var(--glass-bg)' : 'var(--bg-card)',
                  borderColor: isActive ? 'var(--accent)' : 'var(--border-subtle)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  opacity: task.completed ? 0.5 : 1,
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Complete checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleComplete(task.id)
                    }}
                    className="w-4.5 h-4.5 rounded flex items-center justify-center border transition-all active:scale-90"
                    style={{
                      borderColor: task.completed ? 'var(--accent)' : 'var(--text-tertiary)',
                      backgroundColor: task.completed ? 'var(--accent)' : 'transparent',
                      color: 'var(--accent-text)',
                    }}
                  >
                    {task.completed && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span 
                      className={`text-xs font-semibold truncate ${task.completed ? 'line-through opacity-70' : ''}`}
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {task.title}
                    </span>
                    <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>
                      Spent: {task.pomodoroCount}/{task.estimatedPomodoros} pomos
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 ml-2">
                  {/* Active status pill */}
                  {!task.completed && (
                    <span 
                      className="text-[8px] px-1.5 py-0.5 rounded font-extrabold select-none"
                      style={{
                        backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-secondary)',
                        color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)',
                      }}
                    >
                      {isActive ? 'FOCUSING' : 'SELECT'}
                    </span>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteTask(task.id)
                    }}
                    className="p-1 rounded transition-colors text-opacity-50 hover:text-opacity-100 hover:text-red-400"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
