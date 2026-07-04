import { useEffect, useState } from 'react'
import AtsAnalyzer from './AtsAnalyzer.jsx'
import SkillGapAnalyzer from './SkillGapAnalyzer.jsx'
import { getJson, putJson } from '../services/api.js'

const emptyProfile = {
  fullName: '',
  phone: '',
  college: '',
  degree: '',
  graduationYear: '',
  portfolioUrl: '',
  linkedinUrl: '',
  careerGoal: '',
}

function StudentDashboard({ user }) {
  const [profile, setProfile] = useState(emptyProfile)
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getJson('/api/student/profile', user.token)
        setProfile({ ...emptyProfile, ...data })
        setStatus('ready')
      } catch (err) {
        setMessage(err.message)
        setStatus('error')
      }
    }

    loadProfile()
  }, [user.token])

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    try {
      const data = await putJson('/api/student/profile', profile, user.token)
      setProfile({ ...emptyProfile, ...data })
      setMessage('Profile updated successfully.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  function updateField(field, value) {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Student dashboard</p>
          <h1>Prepare, analyze, and improve your profile.</h1>
          <p>Edit your student details, upload resume files for ATS scoring, and compare your resume with target JDs.</p>
        </div>
      </section>

      <section className="workspace-section">
        <div className="section-copy compact">
          <p className="eyebrow">Student details</p>
          <h2>Edit profile</h2>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input value={profile.fullName} onChange={(event) => updateField('fullName', event.target.value)} required />
          </label>
          <label>
            Phone
            <input value={profile.phone || ''} onChange={(event) => updateField('phone', event.target.value)} />
          </label>
          <label>
            College
            <input value={profile.college || ''} onChange={(event) => updateField('college', event.target.value)} />
          </label>
          <label>
            Degree
            <input value={profile.degree || ''} onChange={(event) => updateField('degree', event.target.value)} />
          </label>
          <label>
            Graduation year
            <input value={profile.graduationYear || ''} onChange={(event) => updateField('graduationYear', event.target.value)} />
          </label>
          <label>
            Portfolio URL
            <input value={profile.portfolioUrl || ''} onChange={(event) => updateField('portfolioUrl', event.target.value)} />
          </label>
          <label>
            LinkedIn URL
            <input value={profile.linkedinUrl || ''} onChange={(event) => updateField('linkedinUrl', event.target.value)} />
          </label>
          <label className="wide-field">
            Career goal
            <textarea value={profile.careerGoal || ''} onChange={(event) => updateField('careerGoal', event.target.value)} rows="4" />
          </label>

          <button type="submit" disabled={status === 'loading'}>Save profile</button>
          {message && <p className={status === 'error' ? 'form-error' : 'form-success'}>{message}</p>}
        </form>
      </section>

      <AtsAnalyzer token={user.token} />
      <SkillGapAnalyzer token={user.token} />
    </>
  )
}

export default StudentDashboard
