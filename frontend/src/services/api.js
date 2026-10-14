
const BACKEND_ENDPOINT = 'http://127.0.0.1:8000/upload-resume'

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api/upload-resume' : BACKEND_ENDPOINT)

export async function uploadResume(file) {
  if (!file) {
    throw new Error('Please select a resume PDF to upload.')
  }

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Please upload your resume as a PDF file.')
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

  if (!data || typeof data !== 'object') {
    throw new Error('The server returned an invalid response.')
  }

  return data
}
