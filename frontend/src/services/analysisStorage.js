const STORAGE_KEY = 'careerlyst_analysis_result'

export function saveAnalysisResult(result) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result))
}

export function getAnalysisResult() {
  try {
    const storedResult = sessionStorage.getItem(STORAGE_KEY)
    return storedResult ? JSON.parse(storedResult) : null
  } catch {
    return null
  }
}

export function clearAnalysisResult() {
  sessionStorage.removeItem(STORAGE_KEY)
}
