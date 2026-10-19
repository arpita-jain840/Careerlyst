const BACKEND_ENDPOINT = 'http://127.0.0.1:8000/upload-resume'

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api/upload-resume' : BACKEND_ENDPOINT)

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? '/api'
    : BACKEND_ENDPOINT.replace('/upload-resume', ''))

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = new Headers()
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Careerlyst could not connect to the server.', 0)
  }

  if (response.status === 204) return null

  let data
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const message = typeof data?.detail === 'string'
      ? data.detail
      : `The request failed (HTTP ${response.status}).`
    throw new ApiError(message, response.status)
  }

  return data
}

export async function loginUser(credentials) {
  return apiRequest('/auth/login', { method: 'POST', body: credentials })
}

export async function signupUser(details) {
  return apiRequest('/auth/signup', { method: 'POST', body: details })
}

export async function getCurrentUser(token) {
  return apiRequest('/auth/me', { token })
}

export async function getApplications(token) {
  return apiRequest('/applications', { token })
}

export async function createApplication(application, token) {
  return apiRequest('/applications', {
    method: 'POST',
    body: application,
    token,
  })
}

export async function updateApplication(applicationId, changes, token) {
  return apiRequest(`/applications/${applicationId}`, {
    method: 'PATCH',
    body: changes,
    token,
  })
}

export async function deleteApplication(applicationId, token) {
  return apiRequest(`/applications/${applicationId}`, {
    method: 'DELETE',
    token,
  })
}

export async function uploadResume(file) {
  if (!file) {
    throw new Error('Please select a resume PDF to upload.')
  }

  const isPdf =
    file.type === 'application/pdf' ||
    (file.type === '' && file.name.toLowerCase().endsWith('.pdf'))

  if (!isPdf || !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Please upload your resume as a PDF file.')
  }

  if (file.size === 0) {
    throw new Error('The selected PDF is empty. Please choose another file.')
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Resume size must be 10 MB or less.')
  }

  const formData = new FormData()
  formData.append('file', file)

  let response

  try {
    response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    })
  } catch {
    throw new Error(
      'Could not connect to Careerlyst. Please check whether the backend server is running.'
    )
  }

  let data

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const message =
      typeof data?.detail === 'string'
        ? data.detail
        : `Resume upload failed (HTTP ${response.status}). Please try again.`

    throw new Error(message)
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('The server returned an invalid response.')
  }

  return data
}
