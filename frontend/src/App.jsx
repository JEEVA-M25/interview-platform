import { useState } from 'react'
import './App.css'
import AdminDashboard from './components/AdminDashboard.jsx'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import LoginPanel from './components/LoginPanel.jsx'
import RegisterPanel from './components/RegisterPanel.jsx'
import StudentDashboard from './components/StudentDashboard.jsx'

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('careerverse-session')
    return saved ? JSON.parse(saved) : null
  })

  function handleLogin(session) {
    setUser(session)
    localStorage.setItem('careerverse-session', JSON.stringify(session))
  }

  function handleLogout() {
    setUser(null)
    localStorage.removeItem('careerverse-session')
  }

  return (
    <div className="app-shell" id="top">
      <Header user={user} onLogout={handleLogout} />

      <main>
        {!user && (
          <>
            <section className="landing-hero">
              <div className="hero-copy">
                <p className="eyebrow">CareerVerse access</p>
                <h1>Resume intelligence for students and placement teams.</h1>
                <p>Students register, manage their profile, upload resumes, and compare against job descriptions. Admins monitor students and run the same analysis tools.</p>
              </div>
              <div className="hero-stats" aria-label="Platform highlights">
                <span><strong>ATS</strong> file scoring</span>
                <span><strong>JD</strong> skill gap</span>
                <span><strong>JWT</strong> role access</span>
              </div>
            </section>
            <section className="auth-layout">
              <RegisterPanel />
              <LoginPanel role="STUDENT" onLogin={handleLogin} />
              <LoginPanel role="ADMIN" onLogin={handleLogin} />
            </section>
          </>
        )}

        {user?.role === 'STUDENT' && <StudentDashboard user={user} />}
        {user?.role === 'ADMIN' && <AdminDashboard user={user} />}
      </main>

      <Footer />
    </div>
  )
}

export default App
