import asyncio
import os
from soniox.client import AsyncSonioxClient
from soniox.types.realtime import RealtimeSTTConfig
from dotenv import load_dotenv

load_dotenv()

async def test_connect():
    api_key = os.getenv("SONIOX_API_KEY")
    if not api_key:
        print("Missing SONIOX_API_KEY")
        return

    client = AsyncSonioxClient(api_key=api_key)
    config = RealtimeSTTConfig(
        model="stt-rt-v4",
        audio_format="auto",
        enable_speaker_diarization=True,
    )
    
    print("Attempting to connect to Soniox with audio_format='auto'...")
    try:
        async with client.realtime.stt.connect(config=config) as session:
            print("Successfully connected to Soniox session!")
            # We don't need to send audio to verify the config is accepted during handshake.
            # Actually, the 400 error in the user's logs arrived AFTER connection,
            # but usually it's because of the config sent during the stream start.
    except Exception as e:
        print(f"Connection failed: {e}")
    finally:
        await client.aclose()

if __name__ == "__main__":
    asyncio.run(test_connect())
