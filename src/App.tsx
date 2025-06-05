import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import { AuthProvider } from './auth'
import MarketInsights from './pages/MarketInsightsSimple'
import CanvasHome from './pages/CanvasHome'
import { TestNPI } from './pages/TestNPI'
import { TestNPIDebug } from './pages/TestNPIDebug'
import { TestNPIMinimal } from './pages/TestNPIMinimal'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<CanvasHome />} />
          <Route path="/market-insights" element={<MarketInsights />} />
          <Route path="/test-npi" element={<TestNPI />} />
          <Route path="/test-npi-debug" element={<TestNPIDebug />} />
          <Route path="/test-npi-minimal" element={<TestNPIMinimal />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App