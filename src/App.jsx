"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import HomePage from "./pages/HomePage"
import AdminLogin from "./pages/AdminLogin"
import VoterInformation from "./pages/VoterInformation"
import LiveResults from "./pages/LiveResults"
import PartyManagement from "./pages/PartyManagement"
import About from "./pages/About"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import "./App.css"

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/admin-login" replace />
}

function AppContent() {
  return (
    <div className="voter-app-container">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/voter-info" element={<VoterInformation />} />
        <Route path="/live-results" element={<LiveResults />} />
        <Route
          path="/party-management"
          element={
            <ProtectedRoute>
              <PartyManagement />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
