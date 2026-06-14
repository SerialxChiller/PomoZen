# 🧘 PomoZen — Premium Pomodoro Timer

A beautiful, feature-rich Pomodoro timer built with **React + TypeScript + Vite + TailwindCSS**.

![PomoZen Preview](./public/vite.svg)

## ✨ Features

- ⏱ **Pomodoro Timer** — Focus, Short Break & Long Break modes
- 🎨 **8 Themes** — Dark, Stone, AMOLED, Neon, Ocean, Forest, Sunset, Paper
- ✅ **Task Checklist** — Add tasks with pomo estimates, track progress
- 🔊 **Ambient Soundscapes** — Rain, Brown Noise, White Noise, Metronome (all offline, no downloads)
- 📊 **Session Stats** — Track sessions & streak
- 💾 **Local Persistence** — Tasks saved to `localStorage`, survive page refreshes
- 🌐 **Browser Tab Countdown** — Timer shown in tab title while running
- 🎵 **Session Chimes** — Audio feedback on session complete

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- npm

### Install & Run

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/PomoZen.git
cd PomoZen

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## 🛠 Tech Stack

| Tool | Purpose |
|---|---|
| [React 18](https://react.dev/) | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite](https://vitejs.dev/) | Build tool & dev server |
| [TailwindCSS](https://tailwindcss.com/) | Utility-first styling |
| [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Offline ambient sounds |

## 📁 Project Structure

```
src/
├── components/       # UI components
│   ├── Timer.tsx         # SVG gradient ring timer
│   ├── TaskList.tsx      # Glassmorphic task checklist
│   ├── SoundController.tsx # Ambient soundscape selector
│   ├── SettingsModal.tsx  # Theme & timer config
│   └── ...
├── context/
│   ├── ThemeContext.tsx   # Theme provider
│   └── audioSynthesizer.ts # Web Audio sound engine
├── hooks/
│   └── useTimer.ts       # Core timer state machine
├── types/
│   └── index.ts          # Shared TypeScript types
└── App.tsx               # Root component
```

## 📄 License

MIT — free to use, modify, and distribute.
