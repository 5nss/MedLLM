"use client";

import Link from "next/link";
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

export default function LiveIntake({ params }: { params: { sessionId: string } }) {
    const { isRecording, startRecording, stopRecording, connectionStatus, lastMessage } = useAudioStream(params.sessionId);

    // State for live transcript
    const [transcripts, setTranscripts] = useState<any[]>([]);

    // State for structured assessment from Groq
    const [assessment, setAssessment] = useState<any>({
        extracted: { signs_and_symptoms: [], allergies: [], medications: [], past_medical_history: [], last_oral_intake: null, events_leading_up: null },
        missing_questions: [],
        soap_summary: { subjective: "", objective: "", assessment: "", plan: "" }
    });

    // Handle WebSocket messages
    useEffect(() => {
        if (!lastMessage) return;

        try {
            const msg = lastMessage as any;
            if (msg.type === "transcript") {
                setTranscripts(prev => [...prev, msg.data]);
            } else if (msg.type === "ui_update") {
                setAssessment(msg.data);
            }
        } catch (e) {
            console.error("Failed to parse websocket message", e);
        }
    }, [lastMessage]);

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
                            J
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800">John Doe</h1>
                            <p className="text-sm text-slate-500 font-medium">Male, 54y • ID: MRN-8829</p>
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
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-all shadow-blue-200 hover:shadow-md">
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
                        {isRecording ? (
                            <span className="flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Recording
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span> Paused
                            </span>
                        )}
                        <span className="text-xs text-slate-400 ml-2">WS: {connectionStatus}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {transcripts.length === 0 && (
                            <div className="text-center text-slate-400 italic text-sm mt-8">
                                Start recording to see live transcription...
                            </div>
                        )}

                        {transcripts.map((t, i) => (
                            <div key={i} className={`flex flex-col gap-1 max-w-[90%] ${t.speaker === "Patient" ? "self-end ml-auto" : ""}`}>
                                <span className={`text-xs font-bold ${t.speaker === "Patient" ? "text-blue-400 text-right" : "text-slate-400"}`}>
                                    {t.speaker} • {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div className={`${t.speaker === "Patient" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-slate-100 text-slate-800 rounded-tl-sm border border-slate-200"} p-3 rounded-2xl shadow-sm text-sm`}>
                                    {t.text}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>


                {/* Column 2: Structured Assessment (6/12 width) */}
                <section className="lg:col-span-6 bg-slate-50 flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-white">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <Stethoscope size={18} className="text-slate-600" /> Structured Assessment
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
                        <form className="space-y-6">

                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Chief Complaint & Subjective (SOAP)</label>
                                <textarea
                                    className="w-full border border-slate-300 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-inner"
                                    rows={3}
                                    placeholder="Listening for complaints..."
                                    value={assessment?.soap_summary?.subjective || ""}
                                    readOnly
                                ></textarea>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide flex items-center gap-2">History of Present Illness (Extracted)</label>
                                <div className="space-y-2">
                                    {assessment?.extracted?.signs_and_symptoms?.map((s: string, i: number) => (
                                        <div key={i} className="text-sm text-slate-700 font-medium bg-slate-50 p-2 rounded border border-slate-100">• {s}</div>
                                    ))}
                                    {(!assessment?.extracted?.signs_and_symptoms || assessment.extracted.signs_and_symptoms.length === 0) && (
                                        <p className="text-sm text-slate-400 italic">No symptoms established yet...</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Past Medical History</label>
                                <div className="space-y-2">
                                    {assessment?.extracted?.past_medical_history?.map((h: string, i: number) => (
                                        <div key={i} className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">• {h}</div>
                                    ))}
                                    {(!assessment?.extracted?.past_medical_history || assessment.extracted.past_medical_history.length === 0) && (
                                        <p className="text-sm text-slate-400 italic">No medical history discussed...</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Assessment & Plan (SOAP)</label>
                                <textarea
                                    className="w-full border border-slate-300 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-inner"
                                    rows={4}
                                    placeholder="Listening for doctor's plan..."
                                    value={(assessment?.soap_summary?.assessment || "") + "\n\nPlan: " + (assessment?.soap_summary?.plan || "")}
                                    readOnly
                                ></textarea>
                            </div>

                        </form>
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

                        {/* Extracted Medications */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                Current Medications
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {assessment?.extracted?.medications?.map((m: any, i: number) => (
                                    <span key={i} className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 text-sm font-medium">
                                        {m.name} {m.dose}
                                    </span>
                                ))}
                                {(!assessment?.extracted?.medications || assessment.extracted.medications.length === 0) && (
                                    <span className="text-sm text-slate-400 italic">None logged.</span>
                                )}
                            </div>
                        </div>

                        {/* Extracted Allergies */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-6 mb-3 flex items-center gap-2">
                                Allergies
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {assessment?.extracted?.allergies?.map((a: string, i: number) => (
                                    <span key={i} className="bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1 text-sm font-medium">
                                        {a}
                                    </span>
                                ))}
                                {(!assessment?.extracted?.allergies || assessment.extracted.allergies.length === 0) && (
                                    <span className="text-sm text-slate-400 italic">None logged.</span>
                                )}
                            </div>
                        </div>

                        {/* Pending Questions (SAMPLE Gaps) */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-6 mb-3 flex items-center gap-2">
                                <AlertTriangle size={14} /> Missing Questions
                            </h3>
                            <ul className="space-y-2">
                                {assessment?.missing_questions?.map((q: any, i: number) => {
                                    let colorClass = "text-slate-700 bg-slate-50 border-slate-200";
                                    let iconClass = "text-slate-400";
                                    if (q.priority === "high") {
                                        colorClass = "text-red-700 bg-red-50 border-red-200 font-medium";
                                        iconClass = "text-red-500";
                                    } else if (q.priority === "medium") {
                                        colorClass = "text-amber-700 bg-amber-50 border-amber-200";
                                        iconClass = "text-amber-500";
                                    } else if (q.priority === "low") {
                                        colorClass = "text-emerald-700 bg-emerald-50 border-emerald-200";
                                        iconClass = "text-emerald-500";
                                    }

                                    return (
                                        <li key={i} className={`flex gap-2 text-sm p-3 rounded-lg border shadow-sm ${colorClass}`}>
                                            <AlertTriangle size={16} className={`flex-shrink-0 mt-0.5 ${iconClass}`} />
                                            <div>
                                                <span className="font-bold block text-xs uppercase mb-1">{q.category}</span>
                                                <span>{q.suggested_question}</span>
                                            </div>
                                        </li>
                                    );
                                })}
                                {(!assessment?.missing_questions || assessment.missing_questions.length === 0) && (
                                    <li className="text-sm text-green-600 font-medium p-3 bg-green-50 rounded-lg border border-green-200">
                                        All SAMPLE protocol topics addressed.
                                    </li>
                                )}
                            </ul>
                        </div>

                    </div>
                </section>

            </main>
        </div>
    );
}
