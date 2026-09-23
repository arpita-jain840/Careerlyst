const BACKEND_ENDPOINT = 'http://127.0.0.1:8000/upload-resume'
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api/upload-resume' : BACKEND_ENDPOINT)

export async function uploadResume(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(API_URL, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Resume upload failed with status ${response.status}`)
  }

  return response.json()
}
