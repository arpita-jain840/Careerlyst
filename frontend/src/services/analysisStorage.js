
const STORAGE_KEY = 'careerlyst_analysis_result'

export function saveAnalysisResult(result) {
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new Error('Invalid analysis result. Cannot save it.')
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result))
  } catch (error) {
    console.error('Failed to save Careerlyst analysis result:', error)
    throw new Error(
      'Analysis completed, but the result could not be saved in this browser session.'
    )
  }
}

export function getAnalysisResult() {
  try {
    const storedResult = sessionStorage.getItem(STORAGE_KEY)

    if (!storedResult) return null

    const result = JSON.parse(storedResult)

    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      return null
    }

    return result
  } catch (error) {
    console.error('Failed to read Careerlyst analysis result:', error)
    return null
  }
}

export function clearAnalysisResult() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear Careerlyst analysis result:', error)
  }
}
