import { useState } from 'react'
import ResultList from './ResultList.jsx'
import { postForm } from '../services/api.js'

const sampleJobDescription = `We need a Java Spring Boot developer with React experience,
REST API design, MySQL, Git, AWS exposure, testing knowledge, and strong communication.`

function SkillGapAnalyzer({ token }) {
  const [jobDescription, setJobDescription] = useState(sampleJobDescription)
  const [resumeFile, setResumeFile] = useState(null)
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('loading')
    setError('')

    try {
      const formData = new FormData()
      formData.append('resume', resumeFile)
      formData.append('jobDescription', jobDescription)
      const data = await postForm('/api/ai/skill-gap', formData, token)
      setResult(data)
      setStatus('success')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <section className="workspace-section" id="skill-gap">
      <div className="section-copy compact">
        <p className="eyebrow">JD matching module</p>
        <h2>Compare the role against an uploaded resume.</h2>
        <p>
          Add the job description and upload the resume file. Gemini analyzes both
          to surface matched skills, missing skills, and a focused preparation plan.
        </p>
      </div>

      <div className="tool-layout">
        <form className="analysis-panel" onSubmit={handleSubmit}>
          <label htmlFor="job-description">Job description</label>
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            rows="8"
            required
          />

          <label htmlFor="gap-resume">Resume upload</label>
          <input
            id="gap-resume"
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
            onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
            required
          />
          <p className="field-hint">Supported: PDF, DOC, DOCX, PPT, PPTX, TXT.</p>

          <button type="submit" disabled={status === 'loading' || !resumeFile}>
            {status === 'loading' ? 'Comparing...' : 'Analyze Skill Gap'}
          </button>
          {error && <p className="form-error">{error}</p>}
        </form>

        <article className="result-panel" aria-live="polite">
          {result ? (
            <>
              <div className="score-row">
                <span>Match Score</span>
                <strong>{result.matchScore}</strong>
              </div>
              <p>{result.summary}</p>
              <ResultList title="Matched skills" items={result.matchedSkills} />
              <ResultList title="Missing skills" items={result.missingSkills} />
              <ResultList title="Action plan" items={result.actionPlan} />
            </>
          ) : (
            <p className="empty-state">Skill-gap insights will appear here after comparison.</p>
          )}
        </article>
      </div>
    </section>
  )
}

export default SkillGapAnalyzer
