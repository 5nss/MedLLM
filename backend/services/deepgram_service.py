import os
import asyncio
import json
import logging
from typing import Callable, Coroutine, Any

import aiohttp
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("deepgram_service")

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

# Deepgram streaming endpoint with query params.
# Browser MediaRecorder sends audio/webm;codecs=opus — Deepgram auto-detects
# the WebM container from the binary EBML header. Do NOT set encoding= here
# because that would imply raw (non-containerized) audio.
DEEPGRAM_WS_URL = (
    "wss://api.deepgram.com/v1/listen"
    "?model=nova-3"
    "&language=ta"  # Changed from 'ta' to 'multi'
    "&smart_format=true"
    "&diarize=true"
    "&punctuate=true"
    "&interim_results=true"
    "&endpointing=500"
)

SPEAKER_MAP = {
    0: "Nurse",
    1: "Patient"
}


class DeepgramLiveTranscription:
    """
    Deepgram live transcription using raw aiohttp WebSocket.
    Bypasses deepgram-sdk entirely because websockets v12 breaks its internal WS client.
    """

    def __init__(
        self,
        on_transcript_callback: Callable[[str, str], Coroutine[Any, Any, None]],
    ):
        self.on_transcript_callback = on_transcript_callback
        self._ws = None
        self._session = None
        self._receive_task = None

    async def connect(self) -> bool:
        """Open the aiohttp WebSocket to Deepgram. Non-blocking after connection."""
        try:
            print("DEBUG: Connecting to Deepgram via aiohttp WS...")
            self._session = aiohttp.ClientSession()
            self._ws = await self._session.ws_connect(
                DEEPGRAM_WS_URL,
                headers={"Authorization": f"Token {DEEPGRAM_API_KEY}"},
                timeout=aiohttp.ClientTimeout(total=None),  # no timeout for long-lived stream
            )
            print("DEBUG: Deepgram WS connected!")

            # Start receive and keepalive background tasks
            self._receive_task = asyncio.create_task(self._receive_loop())
            self._keepalive_task = asyncio.create_task(self._keepalive_loop())
            return True

        except Exception as e:
            import traceback; traceback.print_exc()
            print(f"CRITICAL: Deepgram connect failed: {e}")
            return False

    async def _keepalive_loop(self):
        """Send a KeepAlive message every 5 seconds so Deepgram doesn't close the connection."""
        try:
            while True:
                await asyncio.sleep(5)
                if self._ws and not self._ws.closed:
                    await self._ws.send_str(json.dumps({"type": "KeepAlive"}))
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"DEBUG: keepalive error: {e}")

    async def _receive_loop(self):
        """Continuously reads messages from Deepgram and fires the transcript callback."""
        try:
            async for msg in self._ws:
                if msg.type == aiohttp.WSMsgType.TEXT:
                    try:
                        data = json.loads(msg.data)
                        # Log every message type for debugging
                        msg_type = data.get("type", "unknown")
                        is_final = data.get("is_final", False)
                        alts = data.get("channel", {}).get("alternatives", [])
                        transcript_text = alts[0].get("transcript", "") if alts else ""
                        print(f"DEBUG: DG msg type={msg_type} is_final={is_final} transcript='{transcript_text[:60]}'")

                        # Only pass final transcripts to the callback
                        if not is_final or not transcript_text.strip():
                            continue

                        channel = data.get("channel", {})
                        alt = channel.get("alternatives", [{}])[0]
                        speaker_id = 1
                        words = alt.get("words", [])
                        if words and "speaker" in words[0]:
                            speaker_id = words[0]["speaker"]
                        speaker_label = SPEAKER_MAP.get(speaker_id, f"Speaker {speaker_id}")

                        print(f"DEBUG: Final transcript → {speaker_label}: {transcript_text}")
                        await self.on_transcript_callback(speaker_label, transcript_text)

                    except Exception:
                        import traceback; traceback.print_exc()
                elif msg.type == aiohttp.WSMsgType.ERROR:
                    print(f"DEBUG: Deepgram WS error: {msg.data}")
                    break
                elif msg.type == aiohttp.WSMsgType.CLOSED:
                    print("DEBUG: Deepgram WS closed remotely")
                    break
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"DEBUG: _receive_loop exception: {e}")

    async def send_audio(self, audio_chunk: bytes):
        """Send a raw WebM/Opus audio chunk to Deepgram."""
        if self._ws and not self._ws.closed:
            try:
                await self._ws.send_bytes(audio_chunk)
            except Exception as e:
                logger.error(f"send_audio error: {e}")

    async def finish(self):
        """Close the Deepgram WebSocket cleanly."""
        try:
            if self._receive_task:
                self._receive_task.cancel()
            if hasattr(self, "_keepalive_task") and self._keepalive_task:
                self._keepalive_task.cancel()
            if self._ws and not self._ws.closed:
                await self._ws.close()
            if self._session and not self._session.closed:
                await self._session.close()
            print("DEBUG: Deepgram connection closed cleanly.")
        except Exception as e:
            logger.error(f"finish() error: {e}")
