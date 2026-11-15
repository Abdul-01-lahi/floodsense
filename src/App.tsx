import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Onboarding from './components/Onboarding'
import TabBar from './components/TabBar'
import { GameProvider } from './context/GameContext'
import Home from './pages/Home'
import Play from './pages/Play'
import Progress from './pages/Progress'
import Result from './pages/Result'
import Trends from './pages/Trends'

function Layout() {
  return (
    <div className="min-h-svh bg-sky-50 text-slate-900">
      <main className="mx-auto w-full max-w-2xl px-4 pb-28 pt-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<Play />} />
          <Route path="/result" element={<Result />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
      </main>
      <TabBar />
    </div>
  )
}

function App() {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return window.localStorage.getItem('floodsense-onboarding-seen') !== 'true'
    } catch {
      return true
    }
  })

  return (
    <GameProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}
    </GameProvider>
  )
}

export default App
