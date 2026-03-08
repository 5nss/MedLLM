import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

import models # Ensure models are loaded to create tables
from routers import patients, sessions
from ws import audio_handler

# Create tables in the MVP SQLite database
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    import logging
    logging.critical(f"Failed to initialize database: {e}")
    raise

app = FastAPI(
    title="Medical Intake App API",
    description="Backend for the Medical Intake App MVP",
    version="1.0.0",
)

# CORS setup for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # TODO: update in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router)
app.include_router(sessions.router)
app.include_router(audio_handler.router)

@app.get("/")
async def root():
    return {"status": "ok", "message": "Medical Intake App API is running."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
