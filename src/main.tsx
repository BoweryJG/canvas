import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { OrbContextProvider } from './components/OrbContextProvider'
import { AuthProvider } from './auth'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <OrbContextProvider>
        <App />
      </OrbContextProvider>
    </AuthProvider>
  </StrictMode>,
)
