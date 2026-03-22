import asyncio
import os
from dotenv import load_dotenv
from services.groq_service import analyze_roles, analyze_transcript

load_dotenv()

async def test_llm():
    test_transcript = """
    Speaker 1: Hi, I'm here for my appointment. I have a terrible headache.
    Speaker 2: I see. How long has it been hurting?
    Speaker 1: About three days now. It throbs right behind my eyes.
    Speaker 2: Any nausea or sensitivity to light?
    Speaker 1: Yes, a little bit of both. I took some Tylenol but it didn't help much.
    """
    
    print(f"Transcript length in words: {len(test_transcript.split())}")
    
    print("\n--- Testing analyze_roles ---")
    try:
        roles = await analyze_roles(test_transcript)
        print("Roles result:", roles)
    except Exception as e:
        print(f"Error in analyze_roles: {e}")
        roles = {}

    print("\n--- Testing analyze_transcript ---")
    try:
        assessment = await analyze_transcript(test_transcript, roles=roles)
        print("Assessment result keys:", assessment.keys())
        print("Extracted medications:", assessment.get("extracted", {}).get("medications"))
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error in analyze_transcript: {e}")

if __name__ == "__main__":
    asyncio.run(test_llm())
