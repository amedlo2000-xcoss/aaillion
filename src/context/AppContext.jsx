import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [diagnosticData, setDiagnosticData] = useState(null)
  const [diagnosticResult, setDiagnosticResult] = useState(null)

  return (
    <AppContext.Provider value={{ user, setUser, diagnosticData, setDiagnosticData, diagnosticResult, setDiagnosticResult }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
