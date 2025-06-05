import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import { AuthProvider } from './auth'
import MarketInsights from './pages/MarketInsightsSimple'
import CanvasHome from './pages/CanvasHome'
import { TestNPI } from './pages/TestNPI'
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
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App