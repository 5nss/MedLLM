interface SOAPData {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}

interface ExtractedData {
    signs_and_symptoms: string[];
    past_medical_history: string[];
}

export function SOAPSummary({ soap, extracted }: { soap?: SOAPData, extracted?: ExtractedData }) {
    return (
        <form className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Chief Complaint & Subjective (SOAP)</label>
                <textarea
                    className="w-full border border-slate-300 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-inner"
                    rows={3}
                    placeholder="Listening for complaints..."
                    value={soap?.subjective || ""}
                    readOnly
                ></textarea>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide flex items-center gap-2">History of Present Illness (Extracted)</label>
                <div className="space-y-2">
                    {extracted?.signs_and_symptoms?.map((s, i) => (
                        <div key={i} className="text-sm text-slate-700 font-medium bg-slate-50 p-2 rounded border border-slate-100">• {s}</div>
                    ))}
                    {(!extracted?.signs_and_symptoms || extracted.signs_and_symptoms.length === 0) && (
                        <p className="text-sm text-slate-400 italic">No symptoms established yet...</p>
                    )}
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Past Medical History</label>
                <div className="space-y-2">
                    {extracted?.past_medical_history?.map((h, i) => (
                        <div key={i} className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">• {h}</div>
                    ))}
                    {(!extracted?.past_medical_history || extracted.past_medical_history.length === 0) && (
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
                    value={(soap?.assessment || "") + "\n\nPlan: " + (soap?.plan || "")}
                    readOnly
                ></textarea>
            </div>
        </form>
    );
}
