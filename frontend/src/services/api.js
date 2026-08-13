const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

import { convertWebmToWav } from '../utils/audioUtils'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options)

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Request failed')
  }

  if (response.status === 204 || response.status === 202) {
    return null
  }

  const text = await response.text()
  return text ? JSON.parse(text) : null
}

function authHeaders(token, contentType = 'application/json') {
  const headers = {}

  if (contentType) {
    headers['Content-Type'] = contentType
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export function postJson(path, payload, token) {
  return request(path, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function putJson(path, payload, token) {
  return request(path, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function getJson(path, token) {
  return request(path, {
    headers: authHeaders(token, null),
  })
}

export function postForm(path, formData, token) {
  return request(path, {
    method: 'POST',
    headers: authHeaders(token, null),
    body: formData,
  })
}

export function patchJson(path, payload, token) {
  return request(path, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

// ── Interview API ────────────────────────────────────────────────────────────

export const interviewApi = {
  /** POST /api/interview/sessions — multipart: resume + role + difficulty */
  createSession(formData, token) {
    return request('/api/interview/sessions', {
      method: 'POST',
      headers: authHeaders(token, null),
      body: formData,
    })
  },

  /** GET /api/interview/sessions */
  getSessions(token) {
    return getJson('/api/interview/sessions', token)
  },

  /** POST /api/interview/sessions/{id}/questions/{qId}/shown */
  markQuestionShown(sessionId, questionId, token) {
    return request(`/api/interview/sessions/${sessionId}/questions/${questionId}/shown`, {
      method: 'POST',
      headers: authHeaders(token, null),
    })
  },

  /** POST /api/interview/sessions/{id}/answers */
  submitAnswer(sessionId, payload, token) {
    return postJson(`/api/interview/sessions/${sessionId}/answers`, payload, token)
  },

  /** POST /api/interview/answers/{answerId}/emotion */
  async submitAnswerEmotion(answerId, audioBlobs, token) {
    const formData = new FormData();
    for (let idx = 0; idx < audioBlobs.length; idx++) {
      const wavBlob = await convertWebmToWav(audioBlobs[idx]);
      formData.append('file', wavBlob, `audio_${idx}.wav`);
    }
    return request(`/api/interview/answers/${answerId}/emotion`, {
      method: 'POST',
      headers: authHeaders(token, null), // let browser set multipart boundary
      body: formData,
    });
  },

  /** POST /api/interview/sessions/{id}/questions/{qId}/skip */
  skipQuestion(sessionId, questionId, token) {
    return request(`/api/interview/sessions/${sessionId}/questions/${questionId}/skip`, {
      method: 'POST',
      headers: authHeaders(token, null),
    })
  },

  /** PATCH /api/interview/sessions/{id}/answers/{answerId}/transcript */
  editTranscript(sessionId, answerId, editedTranscript, token) {
    return request(
      `/api/interview/sessions/${sessionId}/answers/${answerId}/transcript?editedTranscript=${encodeURIComponent(editedTranscript)}`,
      { method: 'PATCH', headers: authHeaders(token, null) }
    )
  },

  /** POST /api/interview/sessions/{id}/end */
  endSession(sessionId, integrityPayload, token) {
    let body = null
    let authTok = token
    if (typeof integrityPayload === 'string') {
      authTok = integrityPayload
    } else if (integrityPayload) {
      body = JSON.stringify(integrityPayload)
    }

    return request(`/api/interview/sessions/${sessionId}/end`, {
      method: 'POST',
      headers: authHeaders(authTok, body ? 'application/json' : null),
      body: body,
    })
  },

  /** POST /api/interview/sessions/{id}/proctor-logs */
  submitProctorLog(sessionId, type, description, token) {
    return request(`/api/interview/sessions/${sessionId}/proctor-logs`, {
      method: 'POST',
      headers: authHeaders(token, 'application/json'),
      body: JSON.stringify({ type, description }),
    })
  },

  /** GET /api/interview/sessions/{id}/report */
  getReport(sessionId, token) {
    return getJson(`/api/interview/sessions/${sessionId}/report`, token)
  },

  /** GET /api/interview/sessions/{id}/report/pdf — returns a Blob */
  async downloadReportPdf(sessionId, token) {
    const response = await fetch(`${API_BASE_URL}/api/interview/sessions/${sessionId}/report/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to download PDF')
    return response.blob()
  },
}

// ── AI API ────────────────────────────────────────────────────────────

export const aiApi = {
  getAtsHistory(token) {
    return getJson('/api/ai/ats-history', token)
  },
  getJobMatchHistory(token) {
    return getJson('/api/ai/job-match-history', token)
  }
}

// ── SPEECH API ────────────────────────────────────────────────────────────

export const speechApi = {
  async synthesizeSpeech(text, token) {
    const response = await fetch(`${API_BASE_URL}/api/speech/tts`, {
      method: 'POST',
      headers: authHeaders(token, 'application/json'),
      body: JSON.stringify({ text }),
    })
    if (!response.ok) throw new Error('Failed to synthesize speech')
    return response.blob()
  },

  async transcribeAudio(audioBlob, token) {
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')
    
    const response = await fetch(`${API_BASE_URL}/api/speech/stt`, {
      method: 'POST',
      headers: authHeaders(token, null), // don't set Content-Type for FormData
      body: formData,
    })
    
    if (!response.ok) throw new Error('Failed to transcribe audio')
    return response.json()
  }
}

// ── DASHBOARD API ─────────────────────────────────────────────────────────

export const dashboardApi = {
  getSummary(token) {
    return getJson('/api/dashboard/summary', token)
  },
  getScores(token) {
    return getJson('/api/dashboard/scores', token)
  }
}

// ── HISTORY API ───────────────────────────────────────────────────────────

export const historyApi = {
  getInterviews(token) {
    return getJson('/api/interviews', token)
  },
  getInterviewDetails(id, token) {
    return getJson(`/api/interviews/${id}`, token)
  },
  async downloadReport(id, token) {
    const response = await fetch(`${API_BASE_URL}/api/interviews/${id}/report`, {
      headers: authHeaders(token, null)
    });
    if (!response.ok) throw new Error("Failed to download report");
    return response.blob();
  }
}

// ── READINESS API ─────────────────────────────────────────────────────────

export const readinessApi = {
  getReadiness(token) {
    return getJson('/api/student/readiness', token)
  },
  generateStudyGuide(token, days) {
    return request(`/api/student/readiness/study-guide?days=${days}`, {
      method: 'POST',
      headers: authHeaders(token, 'application/json')
    });
  },
  downloadStudyGuidePdf(token, studyGuideData) {
    return fetch(`${API_BASE_URL}/api/student/readiness/study-guide/pdf`, {
      method: 'POST',
      headers: authHeaders(token, 'application/json'),
      body: JSON.stringify(studyGuideData)
    }).then(res => {
      if (!res.ok) throw new Error('Failed to download PDF');
      return res.blob();
    });
  }
}
