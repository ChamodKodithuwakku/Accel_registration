import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import { LanguageProvider } from './context/LanguageContext'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register'

export default function App() {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </LanguageProvider>
  )
}
