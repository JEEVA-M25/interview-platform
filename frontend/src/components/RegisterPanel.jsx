import { useState } from 'react'
import { postJson } from '../services/api.js'

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  college: '',
  degree: '',
  graduationYear: '',
}

function RegisterPanel() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('loading')
    setError('')
    setSuccess('')

    try {
      const response = await postJson('/api/auth/register/student', form)
      setForm({ ...initialForm, email: response.email })
      setSuccess(response.message)
      setStatus('success')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <form className="auth-card register-card" onSubmit={handleSubmit}>
      <div className="auth-card-head">
        <p className="eyebrow">New student</p>
        <h2>Create student account</h2>
        <p>Register once, then manage your profile and run resume analysis from your dashboard.</p>
      </div>

      <div className="auth-fields two-column">
        <label>
          Full name
          <input value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} minLength="6" required />
        </label>
        <label>
          Phone
          <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
        </label>
        <label>
          College
          <input value={form.college} onChange={(event) => updateField('college', event.target.value)} />
        </label>
        <label>
          Degree
          <input value={form.degree} onChange={(event) => updateField('degree', event.target.value)} />
        </label>
        <label>
          Graduation year
          <input value={form.graduationYear} onChange={(event) => updateField('graduationYear', event.target.value)} />
        </label>
      </div>

      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Creating account...' : 'Create student account'}
      </button>
      {success && <p className="form-success">{success}</p>}
      {error && <p className="form-error">{error}</p>}
    </form>
  )
}

export default RegisterPanel
