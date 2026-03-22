"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Mic,
    StopCircle,
    Stethoscope,
    Activity,
    AlertTriangle,
    BrainCircuit,
    Save
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useAudioStream } from "@/hooks/useAudioStream";
import { RecordingIndicator } from "@/components/session/RecordingIndicator";
import { TranscriptFeed } from "@/components/session/TranscriptFeed";
import { SOAPSummary } from "@/components/session/SOAPSummary";
import { MedicationTags } from "@/components/session/MedicationTags";
import { MissingQuestions } from "@/components/session/MissingQuestions";
import { MedicationVerificationModal } from "@/components/session/MedicationVerificationModal";
import { api } from "@/lib/api";

export default function LiveIntake({ params }: { params: { sessionId: string } }) {
    const router = useRouter();
    const { isRecording, startRecording, stopRecording, connectionStatus, lastMessage, sendJsonMessage } = useAudioStream(params.sessionId);

    // State for session and patient
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // State for live transcript
    const [transcripts, setTranscripts] = useState<any[]>([]);

    // State for structured assessment from Groq
    const [assessment, setAssessment] = useState<any>({
        extracted: { signs_and_symptoms: [], allergies: [], medications: [], past_medical_history: [], last_oral_intake: null, events_leading_up: null },
        missing_questions: [],
        soap_summary: { subjective: "", objective: "", assessment: "", plan: "" }
    });

    // State for unverified medications
    const [pendingMeds, setPendingMeds] = useState<any[]>([]);

    // Fetch session data on load
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const data = await api.getSession(params.sessionId);
                setSession(data);
            } catch (err) {
                console.error("Failed to fetch session:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [params.sessionId]);

    // Handle WebSocket messages
    useEffect(() => {
        if (!lastMessage) return;

        try {
            const msg = lastMessage as any;
            if (msg.type === "transcript") {
                setTranscripts(prev => [...prev, msg.data]);
            } else if (msg.type === "ui_update") {
                setAssessment(msg.data);
            } else if (msg.type === "new_medications_detected") {
                setPendingMeds(prev => {
                    const existingNames = new Set(prev.map(m => (typeof m === 'string' ? m : (m.medication || m.name || "")).toLowerCase()));
                    const newUnique = msg.data.filter((m: any) => !existingNames.has((typeof m === 'string' ? m : (m.medication || m.name || "")).toLowerCase()));
                    return [...prev, ...newUnique];
                });
            }
        } catch (e) {
            console.error("Failed to parse websocket message", e);
        }
    }, [lastMessage]);

    const handleSaveAssessment = async () => {
        try {
            await api.updateSessionStatus(params.sessionId, "completed");
            router.push("/");
        } catch (e) {
            console.error("Failed to save assessment", e);
            alert("Failed to save assessment!");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
            {/* Top Navigation */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 font-medium">
                        <ArrowLeft size={20} /> Back to Lobby
                    </Link>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                            {session?.patient?.name?.charAt(0) || "?"}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800">{session?.patient?.name || "Loading..."}</h1>
                            <p className="text-sm text-slate-500 font-medium">
                                {session?.patient?.gender || "Unknown"}, {session?.patient?.dob || "N/A"} • ID: {session?.patient?.mrn || "N/A"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isRecording ? (
                        <button
                            onClick={stopRecording}
                            className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors border border-red-200"
                        >
                            <StopCircle size={20} /> Stop Recording
                        </button>
                    ) : (
                        <button
                            onClick={startRecording}
                            className="flex items-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-4 py-2 rounded-lg font-medium transition-colors border border-emerald-200"
                        >
                            <Mic size={20} /> Start Recording
                        </button>
                    )}
                    <button onClick={handleSaveAssessment} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-all shadow-blue-200 hover:shadow-md">
                        <Save size={20} /> Save Assessment
                    </button>
                </div>
            </header>

            {/* Main 3-Column Layout */}
            <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 relative">

                {/* Column 1: Live Transcript (3/12 width) */}
                <section className="lg:col-span-3 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <Mic size={18} className="text-blue-600" /> Live Transcript
                        </h2>
                        <RecordingIndicator isRecording={isRecording} connectionStatus={connectionStatus} />
                    </div>

                    <TranscriptFeed transcripts={transcripts} />
                </section>


                {/* Column 2: Structured Assessment (6/12 width) */}
                <section className="lg:col-span-6 bg-slate-50 flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-white">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <Stethoscope size={18} className="text-slate-600" /> Structured Assessment
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
                        <SOAPSummary soap={assessment?.soap_summary} extracted={assessment?.extracted} />
                    </div>
                </section>


                {/* Column 3: AI Assistant (3/12 width) */}
                <section className="lg:col-span-3 bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-blue-50/50 flex items-center justify-between">
                        <h2 className="font-bold text-blue-800 flex items-center gap-2">
                            <BrainCircuit size={18} className="text-blue-600" /> AI Clinical Assistant
                        </h2>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        <MedicationTags medications={assessment?.extracted?.medications} allergies={assessment?.extracted?.allergies} />

                        {/* Pending Questions (SAMPLE Gaps) */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-6 mb-3 flex items-center gap-2">
                                <AlertTriangle size={14} /> Missing Questions
                            </h3>
                            <MissingQuestions questions={assessment?.missing_questions} />
                        </div>
                    </div>
                </section>

            </main>

            <MedicationVerificationModal 
                medications={pendingMeds}
                onApprove={(meds) => {
                    sendJsonMessage({ type: "medications_verified", data: meds });
                    // Update the local state aggressively so it shows up
                    setAssessment((prev: any) => ({
                        ...prev,
                        extracted: {
                            ...prev.extracted,
                            medications: [...(prev.extracted?.medications || [])]
                        }
                    }));
                    setPendingMeds([]);
                }}
                onReject={() => setPendingMeds([])}
            />
        </div>
    );
}
