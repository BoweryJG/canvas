import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppWithAuth from './AppWithAuth.tsx'
import { OrbContextProvider } from './components/OrbContextProvider'
import { AuthProvider } from './auth'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <OrbContextProvider>
        <AppWithAuth />
      </OrbContextProvider>
    </AuthProvider>
  </StrictMode>,
)
