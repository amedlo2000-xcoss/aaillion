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
import SimpleTop from './pages/SimpleTop'
import SimpleForm from './pages/SimpleForm'
import SimpleResult from './pages/SimpleResult'

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
          {/* スマホ向けシンプル診断フロー */}
          <Route path="/simple" element={<SimpleTop />} />
          <Route path="/simple/form" element={<SimpleForm />} />
          <Route path="/simple/result" element={<SimpleResult />} />
          <Route path="/s" element={<Navigate to="/simple" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
