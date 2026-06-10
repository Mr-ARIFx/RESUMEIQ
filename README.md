# ResumeIQ — AI-powered Resume Analysis & ATS Optimization Hub

ResumeIQ is a next-generation, portfolio-ready **ATS Resume Parser & Recruitment Compatibility Optimization platform**. Built using a high-density full-stack engine, ResumeIQ translates raw document structures, resumes, and text lists into a comprehensive quality audit in seconds, allowing candidates and recruiters to evaluate formatting stability, score individual criteria, map soft or hard skills, and Tayor alignments to actual job descriptions.

---

## Technical Architecture

* **Frontend Framework:** React 19 + TypeScript (configured under modular components to optimize execution stability)
* **Styling Engine:** Tailwind CSS (featuring dedicated dark/light modes and custom system print-media layout styles)
* **Backend Services:** Node.js + Express (handling Base64 context compression, file streams, and history log pipelines)
* **AI Parser Engine:** @google/genai TypeScript SDK integration with Gemini 3.5 Flash model (parsing complex files synchronously with strict JSON responseSchema validation)
* **Data Storage:** Structured, locally synchronized JSON Database (`database/resume_db.json`) with an automatic safe in-memory fallback pattern

---

## Key Core Features

1. **Multimodal Core Parse:** Accepts raw text pastes or base64 PDF streams directly, processing layout markers without needing fragile native binaries.
2. **Circular ATS Health Radial Gauge:** Intuitively flags real-time metrics across crucial segments: Contact, Education, Skills, Projects, Experience, Certifications, and Formatting.
3. **Structured Skill Matrix Map:** Classifies skills found in the profile into distinct technical clusters (Languages, Frontend, Cloud & DevOps, databases, etc.) and Soft values.
4. **Keyword Density Calculations:** Computes individual counts and percentage frequencies with custom styled progress indicators alongside "Missing Targeted Keywords" alerts.
5. **Action-Verb replacements:** Scans bullet phrasings for proactive action verbs while flagging passive indicators (e.g., replacement parameters to upgrade *"Worked on"* to *"Spearheaded"*).
6. **Tailored Job Matching:** Compares your resume against any target opening pasted, outputs a matching alignment score, highlights missing requirements, and outputs optimization plans.
7. **Resume Leaderboards:** HR-grade rankings evaluating all parsed summaries together. Search, filters, and ranks lists by general ATS score, technical volume, or custom skills.
8. **Print-optimized Exports:** Activates custom CSS media queries when printing or downloading as PDF to deliver pristine, paper-safe, gutter-balanced physical reports.
9. **History Directory:** Synchronizes records securely, enabling recruiters to audit or delete specific candidate directories on demand.

---

## Folder Structure

```text
resumeiq/
├── database/                   # Persistent local database path
│   └── resume_db.json          # Synchronised candidate reports and matching indices
├── public/                     # Static media assets and metadata
├── src/
│   ├── components/
│   │   ├── ThemeToggle.tsx     # Light/Dark stylesheet toggler
│   │   ├── ResumeUpload.tsx    # Drag over dropzones and loaders
│   │   ├── AnalysisDashboard.tsx # Scoring radial gauges, matrices, and charts
│   │   ├── JobMatch.tsx        # Skill-gap comparative analytics and comparisons
│   │   ├── HistoryList.tsx     # Candidate directory lists and delete actions
│   │   └── CompareRank.tsx     # HR leaderboards and criteria rankers
│   ├── types.ts                # TypeScript strict schema contracts
│   ├── App.tsx                 # Single-screen router page container
│   ├── index.css               # Media-print layers and Tailwind roots
│   └── main.tsx                # StrictMode entry loader
├── server.ts                   # Express full-stack backend and lazy Gemini client
├── metadata.json               # Application descriptor configurations
├── package.json                # Bundler configurations and active dependencies
└── tsconfig.json               # TypeScript compiler options
```

---

## Installation & Setup

1. **Configure API Secrets:**
   Ensure your Google Gemini API key is registered. Set the variable inside your workspace environments:
   ```env
   # .env
   GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"
   ```

2. **Install Active Dependencies:**
   ```bash
   npm install
   ```

3. **Launch Local Development Terminal:**
   ```bash
   npm run dev
   ```
   Hosts both the backend Express APIs and front compilation hot reload pipelines on `http://localhost:3000`.

4. **Production Build Compilation:**
   ```bash
   npm run build
   ```
   Bundles assets and server scripts cleanly to `/dist` directories.

---

## Application Layout Operations

### 1. Landing Platform Page
Briefly introduces ResumeIQ with a SaaS layout bento-grid. Contains a central primary call-to-action trigger to **Analyze Resume** immediately.

### 2. File Scan Dashboard
Provides a dual-method uploading dock. Supports dragging PDF uploads directly or copying raw clipboard content. Real-time simulators outline exactly what segment is processing (e.g., *"Reading file structure..."*).

### 3. Active Scoring Screen
Reviews the candidate report profile. Displays contact parameters inside copyable cards, maps segment scoring charts, outputs present vs. missing markers, calculates keyword frequencies, replaces action verbs, and generates recommendations. Includes immediate triggers to download CSV reports or open printable paper layouts.

### 4. Job Match Compare
Pastes target opening listings, selects an active candidate from history, and extracts tailored alignment reports detailing missing keywords, core overlaps, and optimization plans.

### 5. Leaderboard Directory
Ranks all candidate profiles side-by-side. Provides HR queries to filter or rank talent by general strength, skill volumes, or custom targeted keywords.

---

## Contribution & Future Roadmap
* **Auto-Tailor PDF Generation:** Auto-integrating layout modifiers to adjust and download re-aligned PDF templates matching target job applications.
* **LinkedIn OAuth Syncer:** Enabling OAuth synchronizations to pulling candidate experience markers directly without raw copypastes.

## License
Licensed under Apache License 2.0. Copyright 2026. Made with professional layout engineering.
