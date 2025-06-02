import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { OrbContextProvider } from './components/OrbContextProvider'
import { AuthContextProvider } from './contexts/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthContextProvider>
      <OrbContextProvider>
        <App />
      </OrbContextProvider>
    </AuthContextProvider>
  </StrictMode>,
)
