import os
from groq import AsyncGroq
import json
from dotenv import load_dotenv

load_dotenv()

ROLES_PROMPT = """
Analyze this short initial snippet of a medical intake conversation and determine which speaker ID represents the Nurse/Provider (the one asking medical questions) and which represents the Patient (the one describing symptoms).

Return ONLY a valid JSON object mapping the raw speaker IDs to their roles. No markdown fences.

Example:
{"1": "Patient", "2": "Nurse"}
"""

SYSTEM_PROMPT = """
You are a clinical AI assistant embedded in a medical intake system.
Your job is to analyze a nurse-patient conversation transcript and return a structured JSON object.

The speakers have been identified as follows: {roles_str}

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

async def analyze_roles(transcript_text: str) -> dict:
    if not transcript_text.strip():
        return {}
        
    client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": ROLES_PROMPT},
                {"role": "user", "content": f"Transcript:\n{transcript_text}"}
            ],
            response_format={"type": "json_object"}
        )
        response_text = completion.choices[0].message.content
        return json.loads(response_text)
    except Exception as e:
        print(f"Failed to parse Groq roles response: {e}")
        return {}

async def analyze_transcript(transcript_text: str, roles: dict = None) -> dict:
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
    
    roles_str = json.dumps(roles) if roles else "Unknown roles"
    formatted_prompt = SYSTEM_PROMPT.format(roles_str=roles_str)
    
    client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
    try:
        completion = await client.chat.completions.create(
            model="moonshotai/kimi-k2-instruct-0905",
            messages=[
                {"role": "system", "content": formatted_prompt},
                {"role": "user", "content": f"Here is the transcript so far:\n\n{transcript_text}"}
            ],
            response_format={"type": "json_object"}
        )
        
        response_text = completion.choices[0].message.content
        return json.loads(response_text)
    except json.JSONDecodeError:
        print("Failed to parse Groq response as JSON:", response_text)
        return {}
    except Exception as e:
        print(f"Error calling Groq: {e}")
        return {}
