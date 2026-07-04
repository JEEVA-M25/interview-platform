const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options)

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Request failed')
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
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
