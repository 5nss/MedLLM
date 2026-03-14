---
project_name: 'MedLLM'
user_name: 'Dev'
date: '2026-03-05T21:18:00+05:30'
sections_completed: ['technology_stack']
existing_patterns_found: 10
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS 3
- *UI Generation:* **Stitch MCP Server** (REQUIRED for UI tasks)
- *Dependencies:* lucide-react (^0.379.0), react-use-websocket (^4.8.1)

**Backend:**
- Python 3.11+
- FastAPI (0.111.0)
- Uvicorn[standard] (0.30.1)
- websockets (12.0)
- sqlalchemy (2.0.30)
- pydantic (2.7.1)

**AI & Third-Party:**
- Soniox SDK (>=2.0.0) - Live Transcription & Translation (English/Tamil)
- Groq SDK (0.9.0) - LLM Processing (`llama3-70b-8192`)
- SQLite (MVP Database)

## Critical Implementation Rules

### 1. Audio Processing & STT
- **Engine:** Use Soniox for low-latency bidirectional translation.
- **Diarization:** Speaker 0 is always mapped to "Nurse", and Speaker 1+ to "Patient".
- **Buffering:** Transcripts must be buffered until a full sentence (punctuation) or speaker change is detected to provide coherent UI updates.
- **Tamil Support:** Configure Soniox with `TranslationConfig` to translate all Tamil inputs to English for Groq analysis.

### 2. Medication Verification Workflow
- **Safety Loop:** AI assessment runs every 10 seconds via WebSockets.
- **Alert Trigger:** Any new medication detected by AI that hasn't been "verified" must trigger a blocking frontend modal (`MedicationVerificationModal`).
- **State Preservation:** The backend must track alerted medications across WebSocket reloads/reconnects using the database as the source of truth.

### 3. UI Aesthetics (Single-File Mandate)
- All new components should follow the sleek, premium design language (vibrant colors, glassmorphism, smooth animations).
- Use `lucide-react` for iconography.
- Avoid generic colors; use Tailwind's slate/blue/amber palettes.

### 4. Patient & Appointment Management
- **Dashboard:** `/patients` lists records with MRN search.
- **Calendar:** `/appointments` uses a custom monthly grid with SVG hover tooltips.
- **Data Integrity:** `medical_intake.db` uses SQLite. Relationships are: `Patient -> 1:* Sessions`, `Patient -> 1:* Appointments`.
- **Analytics:** `/analytics` uses `recharts` to visualize waiting volumes and symptom trends. Aggregate logic lives in `backend/services/analytics_service.py`.
