import { useState, useSyncExternalStore } from 'react'
import { audioSynth } from '../context/audioSynthesizer'

function subscribeToAudioDiag(callback: () => void) {
  const id = setInterval(callback, 500)
  return () => clearInterval(id)
}

function getSnapshot() {
  return audioSynth.diag
}

export default function AudioDiagnostics() {
  const [open, setOpen] = useState(false)
  const [beepResult, setBeepResult] = useState<string | null>(null)

  const diag = useSyncExternalStore(subscribeToAudioDiag, getSnapshot)

  const handleTestBeep = () => {
    const result = audioSynth.testBeep()
    setBeepResult(JSON.stringify(result, null, 2))
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-2 left-2 z-50 text-[10px] px-2 py-1 rounded-lg font-bold"
        style={{
          backgroundColor: 'var(--glass-bg)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--accent)',
        }}
      >
        🎯 Debug
      </button>
    )
  }

  return (
    <div
      className="fixed bottom-2 left-2 z-50 p-3 rounded-xl text-[10px] font-mono max-w-xs max-h-[50vh] overflow-y-auto"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--accent)',
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-xs">🎯 Audio Diagnostics</span>
        <button onClick={() => setOpen(false)} className="text-xs opacity-50 hover:opacity-100">✕</button>
      </div>

      <div className="space-y-1">
        <div>Context: <span className="font-bold">{audioSynth['ctx']?.state ?? 'null'}</span></div>
        <div>Current Sound: <span className="font-bold">{audioSynth.getCurrentType()}</span></div>
        <div>Volume: <span className="font-bold">{Math.round(audioSynth.getVolume() * 100)}%</span></div>
        <div>Context Created: <span className="font-bold">{diag.ctxCreated}</span></div>
        <div>Context Resumed: <span className="font-bold">{diag.ctxResumed}</span></div>
        <div>Nodes Created: <span className="font-bold">{diag.nodesCreated}</span></div>
        <div>Nodes Started: <span className="font-bold">{diag.nodesStarted}</span></div>
        <div>Nodes Failed: <span className="font-bold" style={{ color: diag.nodesFailed > 0 ? 'var(--accent)' : 'inherit' }}>{diag.nodesFailed}</span></div>
        <div>Beep Attempted: <span className="font-bold">{diag.beepAttempted}</span></div>
        <div>Beep Succeeded: <span className="font-bold" style={{ color: diag.beepSucceeded > 0 ? '#4ade80' : 'inherit' }}>{diag.beepSucceeded}</span></div>
        <div>Beep Failed: <span className="font-bold" style={{ color: diag.beepFailed > 0 ? '#ef4444' : 'inherit' }}>{diag.beepFailed}</span></div>
        {diag.lastError && (
          <div className="mt-1 p-1 rounded text-[9px] break-all" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
            Error: {diag.lastError}
          </div>
        )}
        <div className="text-[9px] opacity-50">Last op: {diag.lastOperation}</div>
      </div>

      <button
        onClick={handleTestBeep}
        className="mt-2 w-full py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-[0.97]"
        style={{
          backgroundColor: 'var(--accent)',
          color: 'var(--accent-text)',
        }}
      >
        🔔 Test Beep (440Hz)
      </button>

      {beepResult && (
        <pre
          className="mt-1 p-1 rounded text-[8px] whitespace-pre-wrap break-all max-h-24 overflow-y-auto"
          style={{
            backgroundColor: 'var(--glass-bg)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {beepResult}
        </pre>
      )}

      <div className="mt-2">
        <div className="text-[9px] font-bold mb-1 opacity-60">Log ({diag.log.length})</div>
        <div className="max-h-16 overflow-y-auto text-[7px] opacity-40 space-y-0.5">
          {diag.log.slice(-10).map((entry, i) => (
            <div key={i}>{entry}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
