import { saveAnalysisResult } from './analysisStorage.js'
import { uploadResume } from './api.js'

let activeJob = null
let jobId = 0

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
  if (!file) {
    activeJob = {
      status: 'error',
      error: 'Please select a resume PDF first.',
      file: null,
    }
    notify()
    return null
  }

  const currentJobId = ++jobId

  activeJob = {
    status: 'running',
    error: '',
    file,
  }
  notify()

  uploadResume(file)
    .then((result) => {
      if (
        !result ||
        typeof result !== 'object' ||
        Object.keys(result).length === 0
      ) {
        throw new Error('The backend returned an empty response.')
      }

      if (currentJobId !== jobId) return

      saveAnalysisResult(result)

      activeJob = {
        status: 'success',
        error: '',
        file,
      }
      notify()
    })
    .catch((error) => {
      if (currentJobId !== jobId) return

      activeJob = {
        status: 'error',
        error:
          error instanceof Error
            ? error.message
            : 'We could not analyze your resume. Please try again.',
        file,
      }
      notify()
    })

  return activeJob
}

export function retryAnalysis(file) {
  return startAnalysis(file)
}
