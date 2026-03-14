# MedLLM - Comprehensive Clinic Management & AI Intake

MedLLM is a sleek, AI-powered clinic management platform. Beyond simple intake, it provides a full suite for patient record management, appointment scheduling, and real-time clinical analytics.

## 🌟 Key Features

### 🎙️ AI-Powered Intake
- **Live Transcription**: Real-time STT powered by **Soniox**, with support for English and Tamil.
- **Intelligent Assessment**: Automatic extraction of Signs/Symptoms, Allergies, Medications, and Medical History using **Groq (Llama 3 70B)**.
- **Medication Verification**: Nurse-in-the-loop verification workflow for high-risk medication extraction.
- **SOAP Summary**: Automagically generated Subjective, Objective, Assessment, and Plan notes.

### 📋 Clinic Management
- **Patient Records**: Searchable MRN-based records with detailed patient profiles.
- **Appointments Hub**: Interactive calendar view for managing clinic visits and scheduling.
- **Analytics Dashboard**: Live data visualization of clinic volume, common complaints, and session completion rates.

---

## 🚀 Getting Started

### 🔧 Backend Setup (FastAPI)

1. **Navigate & Environment**:
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

2. **Configure `.env`**:
   ```env
   SONIOX_API_KEY=your_soniox_key
   GROQ_API_KEY=your_groq_key
   DATABASE_URL=sqlite:///./medical_intake.db
   ```

3. **Start the Server**:
   ```bash
   python main.py
   ```

### 🎨 Frontend Setup (Next.js)

1. **Install & Run**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🏗️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide React, Recharts.
- **Backend**: FastAPI (Python), SQLAlchemy ORM, WebSockets.
- **AI Infrastructure**:
  - **Soniox**: Live Speech-to-Text with multi-language support.
  - **Groq**: High-speed LLM processing for clinical reasoning.
- **Database**: SQLite (Local development).

---

## 📂 Project Structure

- `backend/`: Python API and AI WebSocket handlers.
- `frontend/`: Next.js application & dashboards.
- `docs/`: Technical specifications and project context.
- `brain/`: Implementation plans and architectural logs.

## 📄 License
Internal Development.
