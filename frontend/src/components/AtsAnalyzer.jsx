import { useState } from 'react'
import ResultList from './ResultList.jsx'
import { postForm } from '../services/api.js'

function AtsAnalyzer({ token }) {
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
      const data = await postForm('/api/ai/ats-score', formData, token)
      setResult(data)
      setStatus('success')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <section className="workspace-section" id="ats">
      <div className="section-copy">
        <p className="eyebrow">Resume ATS module</p>
        <h1>Analyze resume readiness from an uploaded file.</h1>
        <p>
          Upload a resume file and get a structured ATS score with keyword coverage,
          strengths, and practical fixes.
        </p>
      </div>

      <div className="tool-layout">
        <form className="analysis-panel" onSubmit={handleSubmit}>
          <label htmlFor="ats-resume">Resume upload</label>
          <input
            id="ats-resume"
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
            onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
            required
          />
          <p className="field-hint">Supported: PDF, DOC, DOCX, PPT, PPTX, TXT.</p>
          <button type="submit" disabled={status === 'loading' || !resumeFile}>
            {status === 'loading' ? 'Analyzing...' : 'Analyze ATS Score'}
          </button>
          {error && <p className="form-error">{error}</p>}
        </form>

        <article className="result-panel" aria-live="polite">
          {result ? (
            <>
              <div className="score-row">
                <span>ATS Score</span>
                <strong>{result.score}</strong>
              </div>
              <p>{result.summary}</p>
              <ResultList title="Strengths" items={result.strengths} />
              <ResultList title="Improvements" items={result.improvements} />
              <ResultList title="Keywords" items={result.keywords} />
            </>
          ) : (
            <p className="empty-state">ATS insights will appear here after upload.</p>
          )}
        </article>
      </div>
    </section>
  )
}

export default AtsAnalyzer
