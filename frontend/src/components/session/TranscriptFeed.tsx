interface TranscriptMessage {
    speaker: "Nurse" | "Patient";
    text: string;
    timestamp: string;
}

export function TranscriptFeed({ transcripts }: { transcripts: TranscriptMessage[] }) {
    return (
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
    );
}
