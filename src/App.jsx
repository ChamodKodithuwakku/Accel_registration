import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register'

function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-slate-400 sm:px-6">
        {t('footer')}
      </div>
    </footer>
  )
}

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

        <Footer />
      </div>
    </LanguageProvider>
  )
}
