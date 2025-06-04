import { useState } from 'react'
import NavBar from './components/NavBar'
import IntegratedCanvasExperience from './components/IntegratedCanvasExperience'
import { AuthProvider } from './auth'
import './App.css'

function App() {
  // State for toggling between classic and cinematic mode
  const [cinematicMode, setCinematicMode] = useState(true)
  
  if (!cinematicMode) {
    // Load the classic app dynamically
    import('./App').then(({ default: ClassicApp }) => {
      return <ClassicApp />
    })
  }

  return (
    <AuthProvider>
      <div className="canvas-app-cinematic">
        <NavBar />
        
        {/* Mode Toggle */}
        <button
          onClick={() => setCinematicMode(!cinematicMode)}
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 1000,
            padding: '10px 20px',
            background: cinematicMode ? 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)' : '#2196F3',
            color: '#fff',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: 700,
            boxShadow: '0 4px 15px rgba(0, 255, 198, 0.3)'
          }}
        >
          {cinematicMode ? '🎬 CINEMATIC' : '🔧 CLASSIC'} MODE
        </button>
        
        {/* Cinematic Experience */}
        <IntegratedCanvasExperience />
      </div>
    </AuthProvider>
  )
}

export default App