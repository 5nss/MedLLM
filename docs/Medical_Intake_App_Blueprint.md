# 🏥 Medical Intake App — Complete Project Blueprint
> **Status: Ready for Development** | All gaps resolved | No auth for MVP

---

## 1. Project Overview & Architecture

**Goal:** Build a medical-grade, tablet-optimized web application MVP for live patient intake. The app captures real-time audio, transcribes it with speaker diarization, processes the medical context using an LLM, and dynamically updates a clinical UI to ensure no critical SAMPLE triage questions are missed.

**System Architecture:**
- **Frontend (Tablet/Web):** Captures microphone audio chunks and streams them via WebSockets. Displays live transcription and dynamic UI updates.
- **Backend (FastAPI):** Receives audio stream, orchestrates external AI calls, and manages the database.
- **Transcription Service:** Deepgram API — real-time medical speaker diarization ("Nurse" vs "Patient").
- **Reasoning Engine:** Groq API (`llama3-70b-8192`) — extracts structured SOAP data and flags missing SAMPLE protocol questions.

---

## 2. Tech Stack (Strictly Enforced)

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| Icons | `lucide-react` |
| WebSocket Client | `react-use-websocket` |
| Backend | Python 3.11+, FastAPI, Uvicorn |
| Database (MVP) | SQLite via SQLAlchemy ORM (swap-ready for PostgreSQL) |
| Transcription | Deepgram Python SDK (Live Transcription) |
| LLM | Groq Python SDK (`llama3-70b-8192`) |
| Auth | **None for MVP** — open access, no login required |

---

## 3. Monorepo Folder Structure

```
medical-intake-app/
├── frontend/                          # Next.js 14 App
│   ├── app/
│   │   ├── layout.tsx                 # Root layout (Inter font, bg-slate-50)
│   │   ├── page.tsx                   # Screen 1: Patient Lobby
│   │   └── session/
│   │       └── [sessionId]/
│   │           └── page.tsx           # Screen 2: Live Intake (3-col layout)
│   ├── components/
│   │   ├── lobby/
│   │   │   ├── PatientSearch.tsx      # Search bar + results list
│   │   │   └── NewPatientForm.tsx     # Create patient form (shown if not found)
│   │   └── session/
│   │       ├── TranscriptFeed.tsx     # Centre col: live scrolling transcript
│   │       ├── MissingQuestions.tsx   # Right col: SAMPLE checklist
│   │       ├── MedicationTags.tsx     # Left col: extracted meds
│   │       ├── RecordingIndicator.tsx # Pulsing red dot + "Recording" label
│   │       └── SOAPSummary.tsx        # Collapsible SOAP notes panel
│   ├── hooks/
│   │   └── useAudioStream.ts          # Mic capture + WebSocket audio sender
│   ├── lib/
│   │   └── api.ts                     # API helper functions (fetch wrappers)
│   ├── types/
│   │   └── index.ts                   # Shared TypeScript types
│   ├── public/
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                           # FastAPI App
│   ├── main.py                        # FastAPI app entry point
│   ├── database.py                    # SQLAlchemy engine + session factory
│   ├── models.py                      # SQLAlchemy ORM table models
│   ├── schemas.py                     # Pydantic request/response schemas
│   ├── routers/
│   │   ├── patients.py                # GET/POST /api/patients
│   │   └── sessions.py                # POST /api/sessions/{patient_id}
│   ├── websockets/
│   │   └── audio_handler.py           # ws://…/ws/audio/{session_id}
│   ├── services/
│   │   ├── deepgram_service.py        # Audio → Deepgram → diarized text
│   │   └── groq_service.py            # Transcript → Groq → structured JSON
│   ├── requirements.txt
│   └── .env                           # API keys (never commit)
│
├── .gitignore
└── README.md
```

---

## 4. Database Schema (SQLAlchemy)

```python
# models.py

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from database import Base

class Patient(Base):
    __tablename__ = "patients"
    id         = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name       = Column(String, nullable=False)
    dob        = Column(String, nullable=False)          # "YYYY-MM-DD"
    mrn        = Column(String, unique=True, nullable=False)  # Medical Record Number
    created_at = Column(DateTime, default=datetime.utcnow)
    sessions   = relationship("Session", back_populates="patient")

class Session(Base):
    __tablename__ = "sessions"
    id                = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id        = Column(String, ForeignKey("patients.id"), nullable=False)
    status            = Column(Enum("active", "review", "completed"), default="active")
    current_complaint = Column(String, nullable=True)
    created_at        = Column(DateTime, default=datetime.utcnow)
    patient           = relationship("Patient", back_populates="sessions")
    transcripts       = relationship("Transcript", back_populates="session")
    assessment        = relationship("Assessment", back_populates="session", uselist=False)

class Transcript(Base):
    __tablename__ = "transcripts"
    id         = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
    speaker    = Column(String, nullable=False)   # "Nurse" | "Patient"
    text       = Column(Text, nullable=False)
    timestamp  = Column(DateTime, default=datetime.utcnow)
    session    = relationship("Session", back_populates="transcripts")

class Assessment(Base):
    __tablename__ = "assessments"
    id                    = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id            = Column(String, ForeignKey("sessions.id"), nullable=False)
    medical_history_json  = Column(Text)   # JSON string
    medications_json      = Column(Text)   # JSON string
    missing_questions_json= Column(Text)   # JSON string (SAMPLE gaps)
    final_summary_text    = Column(Text)
    updated_at            = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    session               = relationship("Session", back_populates="assessment")
```

---

## 5. API & WebSocket Flow

### REST Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/patients?search={query}` | Search patients by name or MRN |
| `POST` | `/api/patients` | Create a new patient |
| `POST` | `/api/sessions/{patient_id}` | Start a new intake session |
| `GET` | `/api/sessions/{session_id}` | Get session + assessment state |
| `PATCH` | `/api/sessions/{session_id}/status` | Update status (review / completed) |

### WebSocket Flow

```
1. START SESSION
   Frontend → POST /api/sessions/{patient_id}
   Backend  → Returns { session_id: "uuid" }

2. OPEN AUDIO STREAM
   Frontend → Opens ws://localhost:8000/ws/audio/{session_id}
   Audio format: audio/webm (Opus codec), 16kHz, mono, 1 channel
   Chunk size: every 250ms of audio (binary frames)

3. STT PIPELINE
   Backend  → Pipes binary audio to Deepgram Live Transcription API
   Deepgram → Returns diarized JSON: { speaker: 0|1, transcript: "..." }
   Backend  → Maps speaker 0 → "Nurse", speaker 1 → "Patient"
   Backend  → Saves to `transcripts` table
   Backend  → Sends to Frontend via WebSocket:
              { "type": "transcript", "data": { "speaker": "Nurse", "text": "..." } }

4. LLM TRIGGER (every 15 seconds, auto)
   Backend  → Compiles full transcript history as formatted string
   Backend  → Sends to Groq API with SAMPLE system prompt
   Groq     → Returns structured JSON (see Section 6)
   Backend  → Saves to `assessments` table
   Backend  → Sends to Frontend via WebSocket:
              { "type": "ui_update", "data": { ...structured JSON... } }

5. MANUAL TRIGGER (optional)
   Frontend → Sends via WebSocket: { "type": "trigger_analysis" }
   Backend  → Immediately runs Step 4 pipeline
```

---

## 6. ✅ Groq System Prompt (SAMPLE Protocol)

> This is the exact system prompt to use in `groq_service.py`.

```python
SYSTEM_PROMPT = """
You are a clinical AI assistant embedded in a medical intake system.
Your job is to analyze a nurse-patient conversation transcript and return a structured JSON object.

You MUST check whether the following SAMPLE protocol questions have been addressed.
SAMPLE stands for:
  - Signs & Symptoms: What are the patient's current complaints and symptoms?
  - Allergies: Does the patient have any known allergies (medications, food, environmental)?
  - Medications: What medications is the patient currently taking (name, dose, frequency)?
  - Past Medical History: Any relevant past illnesses, surgeries, or chronic conditions?
  - Last Oral Intake: When did the patient last eat or drink anything?
  - Events Leading Up: What events or circumstances led to this visit today?

Return ONLY valid JSON. No explanation, no preamble, no markdown fences.

Output format:
{
  "extracted": {
    "signs_and_symptoms": ["string"] | [],
    "allergies": ["string"] | [],
    "medications": [{"name": "string", "dose": "string", "frequency": "string"}] | [],
    "past_medical_history": ["string"] | [],
    "last_oral_intake": "string" | null,
    "events_leading_up": "string" | null
  },
  "missing_questions": [
    {
      "category": "Signs & Symptoms" | "Allergies" | "Medications" | "Past Medical History" | "Last Oral Intake" | "Events Leading Up",
      "suggested_question": "string",
      "priority": "high" | "medium" | "low"
    }
  ],
  "soap_summary": {
    "subjective": "string",
    "objective": "string (write N/A if no objective data in transcript)",
    "assessment": "string",
    "plan": "string (write N/A if not yet discussed)"
  }
}
"""
```

**Priority rules for the agent to implement in `groq_service.py`:**
- `"high"` — category has zero information in transcript
- `"medium"` — category was partially addressed but lacks key detail
- `"low"` — category was addressed, minor clarification may help

---

## 7. Audio Configuration (Deepgram)

```python
# deepgram_service.py — Live Transcription options

DEEPGRAM_OPTIONS = {
    "model": "nova-2-medical",      # Medical vocabulary model
    "language": "en-US",
    "smart_format": True,
    "diarize": True,                # Speaker separation ON
    "diarize_version": "latest",
    "channels": 1,
    "sample_rate": 16000,
    "encoding": "opus",             # Matches browser audio/webm (Opus)
    "punctuate": True,
    "interim_results": False,       # Only send final results to reduce noise
    "utterance_end_ms": 1000,       # Wait 1s of silence before finalizing
}

# Speaker mapping
SPEAKER_MAP = {
    0: "Nurse",
    1: "Patient"
}
```

**Frontend mic capture config (`useAudioStream.ts`):**
```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    channelCount: 1,
    sampleRate: 16000,
    echoCancellation: true,
    noiseSuppression: true,
  }
});

const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm;codecs=opus',
});

mediaRecorder.start(250); // fire ondataavailable every 250ms
```

---

## 8. Frontend UI Component Specs

### Design Tokens

| Token | Value |
|---|---|
| Global Background | `bg-slate-50` |
| Cards | `bg-white rounded-2xl shadow-sm border border-slate-100 p-6` |
| Font | Inter (Google Fonts) |
| Primary Action | `bg-blue-600` (#0061FF) |
| Success | `text-emerald-600` |
| Warning | `text-amber-500` |
| Critical | `text-red-500` |

### Screen 1 — Patient Lobby

**Flow:**
1. Staff sees a search bar at the top.
2. As they type (name or MRN), results appear live below (client-side filter or API call).
3. If patient is found → click to select → "Start Session" button activates.
4. If patient is NOT found → "Create New Patient" button appears → inline form slides in with fields: Full Name, Date of Birth, MRN.
5. On submit → POST `/api/patients` → then immediately POST `/api/sessions/{patient_id}` → redirect to Screen 2.

**Key components:**
- `PatientSearch.tsx` — controlled input, debounced search (300ms), results list with name + MRN + DOB.
- `NewPatientForm.tsx` — shown conditionally. Fields: `name` (text), `dob` (date picker), `mrn` (text). Submit button: `bg-blue-600`.

### Screen 2 — Live Intake (3-Column Layout)

```
grid-cols-12 gap-6 h-screen p-6

[ Left: span-3 ]     [ Centre: span-6 ]     [ Right: span-3 ]
─────────────────    ──────────────────────   ─────────────────
Patient Info Card    RecordingIndicator        SAMPLE Checklist
                     ─────────────────────    (MissingQuestions)
Medications          TranscriptFeed            ─────────────────
(MedicationTags)     (scrollable, auto-        Priority badges:
                      scroll to bottom)         🔴 high
                     ─────────────────────     🟡 medium
                     SOAPSummary               🟢 low
                     (collapsible panel)
```

**RecordingIndicator:**
```tsx
<div className="flex items-center gap-2">
  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
  <span className="text-sm font-medium text-slate-700">Recording</span>
</div>
```

**MissingQuestions** — renders the `missing_questions` array from Groq:
- Red badge for `high`, amber for `medium`, emerald for `low`
- Each item shows the SAMPLE category + `suggested_question` text
- When a category is resolved → item gets a green checkmark + strikethrough

**MedicationTags** — renders the `medications` array:
- Each med = a pill-shaped tag: `bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm`
- Shows name + dose (e.g. "Metformin 500mg")

**TranscriptFeed** — renders `transcript` WebSocket messages:
- "Nurse" lines: left-aligned, `text-slate-500`, label `bg-slate-100`
- "Patient" lines: slightly indented, `text-slate-800`, label `bg-blue-50 text-blue-700`
- Auto-scrolls to bottom on new entry

---

## 9. WebSocket Message Contract

All messages are JSON. The frontend must handle both types:

```typescript
// From backend → frontend
type WsMessage =
  | { type: "transcript"; data: { speaker: "Nurse" | "Patient"; text: string; timestamp: string } }
  | { type: "ui_update"; data: UiUpdate }
  | { type: "error"; data: { message: string } }

// From frontend → backend (manual trigger)
type WsClientMessage =
  | { type: "trigger_analysis" }
  | { type: "ping" }

// UiUpdate shape (matches Groq output)
interface UiUpdate {
  extracted: {
    signs_and_symptoms: string[];
    allergies: string[];
    medications: { name: string; dose: string; frequency: string }[];
    past_medical_history: string[];
    last_oral_intake: string | null;
    events_leading_up: string | null;
  };
  missing_questions: {
    category: string;
    suggested_question: string;
    priority: "high" | "medium" | "low";
  }[];
  soap_summary: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
}
```

---

## 10. Environment Variables

```bash
# backend/.env
DEEPGRAM_API_KEY=your_deepgram_key_here
GROQ_API_KEY=your_groq_key_here
DATABASE_URL=sqlite:///./medical_intake.db

# frontend/.env.local
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 11. Execution Phases (For Coding Agent — One at a Time)

| Phase | Task | Key Files |
|---|---|---|
| **1** | Backend Skeleton — FastAPI init, SQLite DB, SQLAlchemy models, Pydantic schemas | `main.py`, `database.py`, `models.py`, `schemas.py` |
| **2** | Frontend Skeleton — Next.js init, Tailwind config, Screen 1 + Screen 2 static UI with dummy data | `page.tsx`, `session/[sessionId]/page.tsx`, all components |
| **3** | Patient Search Flow — Search API endpoint + `PatientSearch.tsx` + `NewPatientForm.tsx` + session creation | `routers/patients.py`, `PatientSearch.tsx`, `NewPatientForm.tsx` |
| **4** | WebSocket Bridge — `useAudioStream.ts` mic capture + FastAPI WS endpoint receiving binary audio | `audio_handler.py`, `useAudioStream.ts` |
| **5** | AI Integration — Deepgram live transcription pipeline + Groq SAMPLE analysis with 15s polling | `deepgram_service.py`, `groq_service.py` |
| **6** | State Sync — Wire Groq JSON into React state; populate MissingQuestions, MedicationTags, TranscriptFeed, SOAPSummary live | All session components + WebSocket hook |

> ⚠️ **Agent instruction:** Complete and confirm each phase before starting the next. Do not proceed to the next phase if the current one has unresolved errors.

---

## 12. requirements.txt (Backend)

```
fastapi==0.111.0
uvicorn[standard]==0.30.1
websockets==12.0
sqlalchemy==2.0.30
deepgram-sdk==3.2.7
groq==0.9.0
python-dotenv==1.0.1
pydantic==2.7.1
aiofiles==23.2.1
```

---

## 13. package.json (Frontend — Key Dependencies)

```json
{
  "dependencies": {
    "next": "14.2.3",
    "react": "^18",
    "react-dom": "^18",
    "typescript": "^5",
    "tailwindcss": "^3",
    "lucide-react": "^0.379.0",
    "react-use-websocket": "^4.8.1"
  }
}
```

---

*Blueprint version 1.0 — All gaps resolved. Ready for agent handoff.*
