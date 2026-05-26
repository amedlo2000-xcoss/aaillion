import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DiagnosticForm from './pages/DiagnosticForm'
import DiagnosticResult from './pages/DiagnosticResult'
import MarketAnalysis from './pages/MarketAnalysis'
import MvpSimulator from './pages/MvpSimulator'
import CrowdfundingAnalysis from './pages/CrowdfundingAnalysis'
import FutureSimulation from './pages/FutureSimulation'
import AdminPanel from './pages/AdminPanel'
import DiagnosticHistory from './pages/DiagnosticHistory'

function App() {
  useEffect(() => { document.title = 'AAillion' }, [])

  return (
    <AppProvider>
      <BrowserRouter>
        <div className="scan-line" />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/diagnostic" element={<DiagnosticForm />} />
          <Route path="/result" element={<DiagnosticResult />} />
          <Route path="/market" element={<MarketAnalysis />} />
          <Route path="/mvp-sim" element={<MvpSimulator />} />
          <Route path="/crowdfunding" element={<CrowdfundingAnalysis />} />
          <Route path="/future-sim" element={<FutureSimulation />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/history" element={<DiagnosticHistory />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
