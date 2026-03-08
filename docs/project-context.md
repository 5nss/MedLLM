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
- Deepgram SDK (3.2.7) - Live Transcription
- Groq SDK (0.9.0) - LLM Processing (`llama3-70b-8192`)
- SQLite (MVP Database)

## Critical Implementation Rules

_Documented after discovery phase_
