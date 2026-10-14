# Careerlyst — AI-Powered Internship Discovery Platform

**Discover opportunities that match your skills, understand why you fit, and take the next step in your career.**

Careerlyst is an AI-powered internship discovery platform designed to help students find relevant opportunities based on their resumes, skills, education, projects, and career interests. It aims to go beyond basic keyword matching by combining AI-powered profile understanding with semantic similarity matching and explainable recommendations.

## ✨ Why Careerlyst?

Finding the right internship can be overwhelming. Students often spend hours searching across different platforms without knowing which opportunities align with their skills and experience.

Careerlyst aims to simplify this process by connecting candidate profiles with relevant opportunities and helping students understand their strengths, skill gaps, and next steps.

## 🚀 Key Features

- **Resume-Based Profile Extraction:** Extract relevant candidate information from uploaded PDF resumes.
- **AI-Powered Role Discovery:** Generate suitable role suggestions and search queries based on a candidate's background and interests.
- **Semantic Opportunity Matching:** Use sentence embeddings and cosine similarity to identify opportunities relevant to a candidate's profile.
- **Explainable Recommendations:** Highlight matched skills, missing skills, eligibility information, and reasons for a potential match where analysis is available.
- **Opportunity Discovery:** Collect internship and job opportunities with source links where available.
- **Personalized Preferences:** Manage preferred roles, locations, work modes, opportunity types, and skills.
- **Save Opportunities:** Shortlist opportunities for later reference.
- **Application Tracking:** Organize opportunities by application status, such as Saved, Applied, Interview, Offer, and Rejected.

*Note: Features that depend on live opportunity discovery, AI analysis, or backend integration may still be under development.*

## 🧠 How It Works

1. **Upload:** The candidate uploads a PDF resume.
2. **Extract:** The backend extracts resume text and relevant profile information.
3. **Understand:** An LLM helps identify candidate skills, experience, education, and potential job preferences.
4. **Discover:** The system uses generated role preferences and search queries to discover relevant opportunities.
5. **Match:** Sentence embeddings and cosine similarity help rank opportunities by relevance.
6. **Explain:** AI analysis can provide matched skills, missing skills, eligibility details, and explanations.
7. **Track:** Candidates can save opportunities and manage their application progress.

## 🛠️ Tech Stack

| Component | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Python, FastAPI |
| LLM Integration | Groq API |
| Resume Parsing | PyMuPDF |
| Semantic Matching | Sentence Transformers, scikit-learn |
| Similarity Metric | Cosine Similarity |
| Local Persistence | Browser localStorage and sessionStorage |
| Version Control | Git and GitHub |

## 🏗️ Project Structure

```text
Careerlyst/
├── backend/
│   ├── ai/
│   │   ├── profile_extractor.py
│   │   ├── job_preferences.py
│   │   ├── opportunity_search.py
│   │   ├── opportunity_analyzer.py
│   │   └── matcher.py
│   ├── utils/
│   │   └── pdf_parser.py
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── UploadPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── OpportunitiesPage.jsx
│   │   ├── SavedPage.jsx
│   │   ├── ApplicationsPage.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── data/
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

- Python 3.11+ recommended
- Node.js and npm
- A Groq API key for backend features that use the LLM

### 1. Clone the Repository

```bash
git clone https://github.com/arpita-jain840/Careerlyst.git
cd Careerlyst
```

### 2. Set Up the Backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` directory and add your Groq API key using the environment variable name expected by the backend configuration.

```env
GROQ_API_KEY=your_groq_api_key_here
```

Start the backend using the project's configured entry point. If `main.py` starts the FastAPI server directly:

```bash
python main.py
```

The default local backend address is expected to be `http://127.0.0.1:8000` if configured accordingly.

### 3. Set Up the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal.

### 4. Configure Frontend–Backend Communication

Ensure the frontend API configuration points to the running backend. If the frontend uses a Vite development proxy, verify its configuration in `frontend/vite.config.js`.

For a deployed environment, configure the appropriate backend URL rather than relying on a localhost address.

## 🔌 Backend API

The backend includes a resume-upload workflow.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/upload-resume` | Upload a PDF resume for profile extraction and opportunity matching |

The endpoint's actual response fields and available routes depend on the current backend implementation.

## 🔐 Security and Privacy

- Keep API keys in environment variables.
- Never commit `.env` files or other secrets.
- Validate uploaded files before processing.
- Avoid uploading resumes containing sensitive personal information to services you do not trust.
- Review third-party API data handling and privacy policies before deploying the platform publicly.

## 🗺️ Roadmap

- [ ] Improve live opportunity discovery and source validation.
- [ ] Strengthen eligibility checks and explainable match scoring.
- [ ] Connect saved preferences to personalized opportunity searches.
- [ ] Add persistent user accounts and database-backed application tracking.
- [ ] Improve error handling, rate-limit management, and automated testing.
- [ ] Deploy the frontend and backend for public access.

## 🎯 Project Goal

Careerlyst aims to make internship discovery more personalized, transparent, and efficient by helping students find relevant opportunities and understand how they can improve their fit for a role.

## 👩‍💻 Author

**Arpita Jain**

GitHub: [@arpita-jain840](https://github.com/arpita-jain840)

---

*Careerlyst — Find your fit. Build your future.*
