import { useEffect, useState } from 'react'
import AtsAnalyzer from './AtsAnalyzer.jsx'
import SkillGapAnalyzer from './SkillGapAnalyzer.jsx'
import { getJson } from '../services/api.js'

function AdminDashboard({ user }) {
  const [students, setStudents] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await getJson('/api/admin/students', user.token)
        setStudents(data)
      } catch (err) {
        setError(err.message)
      }
    }

    loadStudents()
  }, [user.token])

  return (
    <>
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h1>Monitor students and run resume analysis.</h1>
          <p>Review student profiles and use the same ATS and skill-gap modules for uploaded resume files.</p>
        </div>
      </section>

      <section className="workspace-section">
        <div className="section-copy compact">
          <p className="eyebrow">Students</p>
          <h2>Registered students</h2>
        </div>

        {error ? (
          <p className="form-error">{error}</p>
        ) : (
          <div className="student-table" role="table" aria-label="Registered students">
            <div className="student-row table-head" role="row">
              <span>Name</span>
              <span>Email</span>
              <span>College</span>
              <span>Degree</span>
              <span>Year</span>
            </div>
            {students.map((student) => (
              <div className="student-row" role="row" key={student.id}>
                <span>{student.fullName}</span>
                <span>{student.email}</span>
                <span>{student.college || '-'}</span>
                <span>{student.degree || '-'}</span>
                <span>{student.graduationYear || '-'}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <AtsAnalyzer token={user.token} />
      <SkillGapAnalyzer token={user.token} />
    </>
  )
}

export default AdminDashboard
