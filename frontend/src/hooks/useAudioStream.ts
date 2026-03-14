"use client";

import { useState, useCallback, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

export function useAudioStream(sessionId: string) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Use the env var to determine WS domain, falling back to localhost
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const wsUrl = apiBase.replace(/^http/, "ws") + `/ws/audio/${sessionId}`;

    // FIX: Always connect (no conditional 3rd arg). This avoids the race condition
    // where startRecording() reads readyState as CLOSED/CONNECTING before WS opens.
    const { sendJsonMessage, lastJsonMessage, readyState, getWebSocket } = useWebSocket(
        wsUrl,
        {
            share: false,
            shouldReconnect: () => true,
            reconnectAttempts: 5,
            reconnectInterval: 2000,
        }
        // NOTE: removed the conditional `isRecording` argument intentionally
    );

    const startRecording = useCallback(async () => {
        // FIX: Wait for WS to be OPEN before starting MediaRecorder.
        // Read the native WebSocket readyState via getWebSocket() so we never
        // hit a stale closure — getWebSocket() always returns the live socket.
        const isOpen = () => {
            const ws = getWebSocket() as WebSocket | null;
            return ws?.readyState === WebSocket.OPEN;
        };

        if (!isOpen()) {
            console.warn("WebSocket not yet open — waiting up to 5s...");
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error("WS connection timeout after 5s")), 5000);
                const interval = setInterval(() => {
                    if (isOpen()) {
                        clearInterval(interval);
                        clearTimeout(timeout);
                        resolve();
                    }
                }, 100);
            });
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    // Note: sampleRate constraint is ignored by MediaRecorder/Opus
                },
            });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm;codecs=opus",
            });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    const ws = getWebSocket();
                    if (ws && (ws as WebSocket).readyState === WebSocket.OPEN) {
                        try {
                            (ws as WebSocket).send(event.data);
                            console.log(`[useAudioStream] Sent audio chunk: ${event.data.size} bytes`);
                        } catch (e) {
                            console.error("[useAudioStream] Failed to send chunk:", e);
                        }
                    } else {
                        console.warn(`[useAudioStream] Dropping chunk: WS readyState is not OPEN (it is ${ws?.readyState})`);
                    }
                }
            };

            mediaRecorder.start(1000); // 1000ms chunks = complete WebM clusters Deepgram can decode
            setIsRecording(true);
        } catch (err) {
            console.error("Microphone access denied or recording error:", err);
            throw err;
        }
    }, [getWebSocket]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    }, [isRecording]);

    return {
        isRecording,
        startRecording,
        stopRecording,
        connectionStatus: {
            [ReadyState.CONNECTING]: "Connecting",
            [ReadyState.OPEN]: "Open",
            [ReadyState.CLOSING]: "Closing",
            [ReadyState.CLOSED]: "Closed",
            [ReadyState.UNINSTANTIATED]: "Uninstantiated",
        }[readyState],
        lastMessage: lastJsonMessage,
        sendJsonMessage,
    };
}
