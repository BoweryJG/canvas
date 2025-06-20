import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { OrbContextProvider } from './components/OrbContextProvider'
import { AuthProvider } from './auth'

// Debug mode - comment out to use normal app
// import AppDebug from './AppDebug.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <OrbContextProvider>
        <App />
      </OrbContextProvider>
    </AuthProvider>
  </StrictMode>,
)
