import { saveAnalysisResult } from './analysisStorage.js'
import { uploadResume } from './api.js'

let activeJob = null
const listeners = new Set()

function notify() {
  listeners.forEach((listener) => listener(activeJob))
}

export function subscribeToAnalysis(listener) {
  listeners.add(listener)
  listener(activeJob)
  return () => listeners.delete(listener)
}

export function getAnalysisJob() {
  return activeJob
}

export function startAnalysis(file) {
  if (!file) return null

  activeJob = { status: 'running', error: '', file }
  notify()

  uploadResume(file)
    .then((result) => {
      if (!result || typeof result !== 'object' || Object.keys(result).length === 0) {
        throw new Error('The backend returned an empty response')
      }
      saveAnalysisResult(result)
      activeJob = { status: 'success', error: '', file }
      notify()
    })
    .catch(() => {
      activeJob = { status: 'error', error: 'We could not analyze your resume. Please try again.', file }
      notify()
    })

  return activeJob
}

export function retryAnalysis(file) {
  return startAnalysis(file)
}