import os
import asyncio
import logging
from typing import Callable, Coroutine, Any

from soniox.client import AsyncSonioxClient
from soniox.types.realtime import RealtimeSTTConfig, TranslationConfig
from dotenv import load_dotenv
from contextlib import AsyncExitStack

load_dotenv()

logger = logging.getLogger("soniox_service")

SONIOX_API_KEY = os.getenv("SONIOX_API_KEY")
if not SONIOX_API_KEY:
    raise RuntimeError("Missing SONIOX_API_KEY environment variable.")

class SonioxLiveTranscription:
    def __init__(
        self,
        on_transcript_callback: Callable[[str, str], Coroutine[Any, Any, None]],
    ):
        self.on_transcript_callback = on_transcript_callback
        self.client = AsyncSonioxClient(api_key=SONIOX_API_KEY)
        self.config = RealtimeSTTConfig(
            model="stt-rt-v4",
            audio_format="auto",
            enable_speaker_diarization=True,
            language_hints=["en", "ta"],
            translation=TranslationConfig(
                type="one_way",
                target_language="en"
            )
        )
        self.session = None
        self._receive_task = None
        self._exit_stack = AsyncExitStack()

    async def connect(self) -> bool:
        try:
            print("DEBUG: Entering Soniox session context...")
            self.session = await self._exit_stack.enter_async_context(
                self.client.realtime.stt.connect(config=self.config)
            )
            print("DEBUG: Soniox session established.")

            self._receive_task = asyncio.create_task(self._receive_loop())
            return True
        except Exception as e:
            logger.error(f"CRITICAL: Soniox connect failed: {e}")
            await self._exit_stack.aclose()
            return False

    async def _receive_loop(self):
        try:
            buffer = ""
            current_speaker = None
            async for event in self.session.receive_events():
                # Process the event
                tokens = getattr(event, "tokens", [])
                
                # Check for errors in the event
                if getattr(event, "error_code", None):
                    logger.error(f"Error from Soniox: {getattr(event, 'error_code')} - {getattr(event, 'error_message')}")
                    continue

                for token in tokens:
                    if not getattr(token, "is_final", False):
                        continue
                    
                    status = getattr(token, "translation_status", "none")
                    if status == "original":
                        continue
                        
                    text = getattr(token, "text", "")
                    speaker_num = getattr(token, "speaker", 1)
                    
                    if current_speaker is not None and speaker_num != current_speaker:
                        if buffer.strip():
                            await self.on_transcript_callback(str(current_speaker), buffer.strip())
                        buffer = text
                        current_speaker = speaker_num
                    else:
                        current_speaker = speaker_num
                        buffer += text
                        if text.strip() and text.strip()[-1] in ".!?":
                            await self.on_transcript_callback(str(current_speaker), buffer.strip())
                            buffer = ""

        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"soniox _receive_loop exception: {e}")

    async def send_audio(self, audio_chunk: bytes):
        if self.session:
            try:
                await self.session.send_byte_chunk(audio_chunk)
            except Exception as e:
                logger.error(f"send_audio error: {e}")

    async def finish(self):
        try:
            if self._receive_task:
                self._receive_task.cancel()
            
            await self._exit_stack.aclose()
            await self.client.aclose()
            print("DEBUG: Soniox connection closed cleanly.")
        except Exception as e:
            logger.error(f"finish() error: {e}")
