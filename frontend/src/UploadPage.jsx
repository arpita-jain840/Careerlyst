import { useRef, useState } from 'react'
import { uploadResume } from './services/api.js'
import ProductNav from './ProductNav.jsx'
import { startAnalysis } from './services/analysisJob.js'

function ProgressSteps() {
  return (
    <div className="flex items-center justify-center gap-2 text-xs font-semibold sm:gap-4" aria-label="Onboarding progress">
      <span className="flex items-center gap-2 text-forest"><span className="flex h-6 w-6 items-center justify-center bg-forest text-[10px] text-white">01</span><span>Resume</span></span>
      <span className="text-slate-300" aria-hidden="true">-&gt;</span>
      <span className="text-slate-400"><span className="mr-2 text-[10px]">02</span>Profile</span>
      <span className="text-slate-300" aria-hidden="true">-&gt;</span>
      <span className="text-slate-400"><span className="mr-2 text-[10px]">03</span>Opportunities</span>
    </div>
  )
}

function UploadIcon() {
  return (
    <svg className="h-8 w-8 text-forest" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 21V6m0 0 5 5m-5-5-5 5M7 18v7h18v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="round" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg className="h-7 w-7 text-forest" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M8 4h10l6 6v18H8V4Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M18 4v7h6M11 17h10M11 21h7" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function FilePreview({ file, onRemove }) {
  const size = `${(file.size / (1024 * 1024)).toFixed(1)} MB`

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4 text-left">
        <span className="flex h-12 w-12 items-center justify-center border border-line bg-mist"><FileIcon /></span>
        <div>
          <p className="text-sm font-semibold text-ink">{file.name}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">PDF <span className="mx-1.5 text-slate-300">/</span> {size}</p>
        </div>
      </div>
      <button type="button" onClick={onRemove} className="focus-ring w-fit text-sm font-semibold text-slate-500 underline decoration-line/80 underline-offset-4 transition-colors hover:text-ink">Remove</button>
    </div>
  )
}

function ResumeUpload({ file, error, onFile, onRemove, onAnalyze }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (selectedFile) => {
    setIsDragging(false)
    onFile(selectedFile)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    handleFile(event.dataTransfer.files[0])
  }

  return (
    <div>
      <input ref={inputRef} className="sr-only" type="file" accept="application/pdf,.pdf" onChange={(event) => handleFile(event.target.files[0])} />
      <div
        className={`border p-5 transition-colors sm:p-8 ${isDragging ? 'border-forest bg-[#f1f8f4]' : 'border-line bg-white hover:border-forest/60'} ${error ? 'border-red-300' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {file ? (
          <FilePreview file={file} onRemove={() => { inputRef.current.value = ''; onRemove() }} />
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
            <span className={`mb-5 flex h-14 w-14 items-center justify-center border ${isDragging ? 'border-forest bg-white' : 'border-line bg-mist'}`}><UploadIcon /></span>
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-ink">Upload your resume</h2>
            <p className="mt-2 text-sm text-slate-500">Drag &amp; drop your PDF here <span className="mx-1 text-slate-300">or</span></p>
            <button type="button" onClick={() => inputRef.current?.click()} className="focus-ring mt-4 border border-forest px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-white">Choose PDF</button>
            <p className="mt-5 text-xs text-slate-400">PDF files <span className="mx-1">•</span> Maximum 10 MB</p>
          </div>
        )}
      </div>
      {error && <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-medium text-red-700" role="alert">{error}</p><button type="button" onClick={() => file ? onAnalyze() : inputRef.current?.click()} className="focus-ring text-sm font-semibold text-forest underline decoration-forest/40 underline-offset-4 hover:text-forest-dark">Try Again</button></div>}
      {file && (
        <>
          <button type="button" onClick={onAnalyze} className="focus-ring mt-5 flex w-full items-center justify-center bg-forest px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-forest-dark">
            Analyze My Resume <span className="ml-3 text-lg leading-none">-&gt;</span>
          </button>
        </>
      )}
    </div>
  )
}

function TrustMessage() {
  return (
    <div className="mt-7 border-t border-line pt-5">
      <p className="text-center text-xs text-slate-500">Your resume is used only to build your personalized career profile.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
        <span><b className="mr-1.5 font-semibold text-forest">✓</b>Secure upload</span>
        <span><b className="mr-1.5 font-semibold text-forest">✓</b>No fake recommendations</span>
        <span><b className="mr-1.5 font-semibold text-forest">✓</b>Personalized matching</span>
      </div>
    </div>
  )
}

function PreferenceForm() {
  return (
    <section className="border-t border-line pt-8">
      <p className="eyebrow">Optional details</p>
      <h2 className="mt-3 font-display text-3xl tracking-[-0.035em] text-ink">Help us personalize your search</h2>
      <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">These details are optional and help Careerlyst find more relevant opportunities.</p>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-ink">Preferred Role<input className="focus-ring mt-2 w-full border border-line bg-white px-4 py-3 font-normal text-ink placeholder:text-slate-400" placeholder="Example: Data Science Intern" /></label>
        <label className="block text-sm font-semibold text-ink">Preferred Location<input className="focus-ring mt-2 w-full border border-line bg-white px-4 py-3 font-normal text-ink placeholder:text-slate-400" placeholder="Example: Delhi / Noida / Remote" /></label>
      </div>
      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-ink">Opportunity Type</legend>
        <div className="mt-3 flex flex-wrap gap-5 text-sm text-slate-600">
          {['Internship', 'Full-time', 'Both'].map((option) => <label key={option} className="flex items-center gap-2"><input type="radio" name="opportunity-type" value={option} defaultChecked={option === 'Internship'} className="h-4 w-4 accent-forest" />{option}</label>)}
        </div>
      </fieldset>
    </section>
  )
}

function UploadPage() {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')

  const selectFile = (selectedFile) => {
    if (!selectedFile) return
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setFile(null)
      setError('Please upload a PDF resume.')
      return
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setFile(null)
      setError('Please upload a PDF resume under 10 MB.')
      return
    }
    setError('')
    setFile(selectedFile)
  }

  const removeFile = () => {
    setFile(null)
    setError('')
  }

  const analyzeResume = () => {
    startAnalysis(file)
    setError('')
    window.history.pushState({}, '', '/analyzing')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <div className="min-h-screen bg-mist text-ink">
      <ProductNav active="" />

      <main>
        <div className="section-wrap py-8 sm:py-10"><ProgressSteps /></div>
        <section className="section-wrap pb-20 sm:pb-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow mb-4">Your starting point</p>
            <h1 className="font-display text-4xl leading-tight tracking-[-0.045em] text-ink sm:text-5xl">Let's understand your career profile.</h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600">Upload your resume and Careerlyst will analyze your skills, projects and experience to discover opportunities that fit you.</p>
          </div>

          <div className="mx-auto mt-12 max-w-2xl">
            <ResumeUpload file={file} error={error} onFile={selectFile} onRemove={removeFile} onAnalyze={analyzeResume} />
            <TrustMessage />
            <div className="mt-16"><PreferenceForm /></div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-white py-7">
        <div className="section-wrap flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Careerlyst</span>
          <span>Build a clearer path forward.</span>
        </div>
      </footer>
    </div>
  )
}

export default UploadPage
