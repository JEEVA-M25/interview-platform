import { useState } from 'react'
import { postJson } from '../services/api.js'

const demoCredentials = {
  STUDENT: { email: 'student@careerverse.ai', password: 'student123' },
  ADMIN: { email: 'admin@careerverse.ai', password: 'admin123' },
}

function LoginPanel({ role, onLogin }) {
  const [credentials, setCredentials] = useState(demoCredentials[role])
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('loading')
    setError('')

    try {
      const session = await postJson('/api/auth/login', credentials)
      if (session.role !== role) {
        throw new Error(`Use the ${session.role.toLowerCase()} login panel for this account`)
      }
      onLogin(session)
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <form className="auth-card login-panel" id={`${role.toLowerCase()}-login`} onSubmit={handleSubmit}>
      <div className="auth-card-head">
        <p className="eyebrow">{role.toLowerCase()} access</p>
        <h2>{role === 'STUDENT' ? 'Student login' : 'Admin login'}</h2>
        <p>{role === 'STUDENT' ? 'Continue to your resume workspace.' : 'Review students and run analysis modules.'}</p>
      </div>

      <div className="auth-fields">
        <label htmlFor={`${role}-email`}>Email</label>
        <input
          id={`${role}-email`}
          type="email"
          value={credentials.email}
          onChange={(event) => setCredentials({ ...credentials, email: event.target.value })}
          required
        />

        <label htmlFor={`${role}-password`}>Password</label>
        <input
          id={`${role}-password`}
          type="password"
          value={credentials.password}
          onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
          required
        />
      </div>

      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Signing in...' : `Login as ${role.toLowerCase()}`}
      </button>
      {error && <p className="form-error">{error}</p>}
    </form>
  )
}

export default LoginPanel
