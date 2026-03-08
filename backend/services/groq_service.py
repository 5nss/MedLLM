import os
from groq import AsyncGroq
import json
from dotenv import load_dotenv

load_dotenv()

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

async def analyze_transcript(transcript_text: str) -> dict:
    if not transcript_text.strip():
        # Return empty structure if no transcript yet
        return {
          "extracted": {
            "signs_and_symptoms": [], "allergies": [], "medications": [],
            "past_medical_history": [], "last_oral_intake": None, "events_leading_up": None
          },
          "missing_questions": [],
          "soap_summary": {
            "subjective": "No data yet", "objective": "N/A", "assessment": "No data yet", "plan": "N/A"
          }
        }
    
    # Instantiate client here so it attaches to Uvicorn's asyncio loop
    client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
    
    completion = await client.chat.completions.create(
        model="llama3-70b-8192",  # Recommended for fast reasoning and JSON parsing
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Here is the transcript so far:\n\n{transcript_text}"}
        ],
        response_format={"type": "json_object"}
    )
    
    response_text = completion.choices[0].message.content
    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        print("Failed to parse Groq response as JSON:", response_text)
        return {}
