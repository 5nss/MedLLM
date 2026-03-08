# MedLLM - Medical Intake App

MedLLM is a state-of-the-art medical intake application that uses AI to streamline the patient-doctor interface. It features live transcription via Deepgram and intelligent processing with Groq.

## 🚀 Getting Started

To get the full experience, you'll need to run both the Backend and the Frontend simultaneously.

### 📋 Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Deepgram API Key**
- **Groq API Key**

---

### 🔧 Backend Setup (Python/FastAPI)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration:**
   Create a `.env` file in the `backend/` directory with the following variables:
   ```env
   DEEPGRAM_API_KEY=your_deepgram_key
   GROQ_API_KEY=your_groq_key
   # DATABASE_URL=sqlite:///./medical_intake.db (Optional, defaults to local file)
   ```

5. **Run the server:**
   ```bash
   python main.py
   # OR
   uvicorn main:app --reload
   ```
   The backend will be running at [http://localhost:8000](http://localhost:8000).

---

### 🎨 Frontend Setup (Next.js)

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env.local` file in the `frontend/` directory if you need to override the default API endpoint (default is usually `http://localhost:8000`).

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Testing on Other Devices

To try out the app on a tablet or mobile phone:
1. Ensure your device is on the **same Wi-Fi network** as your computer.
2. Find your computer's **Local IP Address** (e.g., `192.168.1.XX`).
3. Update the backend to listen on all interfaces:
   ```python
   # In main.py
   uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
   ```
4. Access the frontend on your mobile browser using: `http://<your-local-ip>:3000`.

---

## 🏗️ Project Structure

- `backend/`: FastAPI application, database models, and AI service logic.
- `frontend/`: Next.js application with Tailwind CSS and live transcription UI.
- `docs/`: Project documentation and specifications.
- `_bmad/`: BMAD framework metadata and UI design assets.

## 🛠️ Technology Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide React.
- **Backend:** FastAPI, SQLAlchemy, Pydantic, WebSockets.
- **AI Services:** Deepgram (Live Audio Transcription), Groq (Llama 3 70B LLM).
- **Database:** SQLite (MVP).

## 🎨 UI Development

This project uses the **Stitch MCP Server** for UI generation and iterations. When working on frontend components:
- Use consistent Tailwind CSS patterns.
- Leverage `lucide-react` for iconography.
- Ensure responsive design for both desktop and mobile views.

## 📄 License
Internal Development.
