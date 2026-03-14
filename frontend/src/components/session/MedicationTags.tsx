interface Medication {
    name: string;
    dose: string;
    frequency: string;
}

export function MedicationTags({ medications, allergies }: { medications?: Medication[], allergies?: string[] }) {
    return (
        <div className="space-y-6">
            {/* Extracted Medications */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    Current Medications
                </h3>
                <div className="flex flex-wrap gap-2">
                    {medications?.map((m, i) => (
                        <span key={i} className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 text-sm font-medium">
                            {m.name} {m.dose}
                        </span>
                    ))}
                    {(!medications || medications.length === 0) && (
                        <span className="text-sm text-slate-400 italic">None logged.</span>
                    )}
                </div>
            </div>

            {/* Extracted Allergies */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    Allergies
                </h3>
                <div className="flex flex-wrap gap-2">
                    {allergies?.map((a, i) => (
                        <span key={i} className="bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1 text-sm font-medium">
                            {a}
                        </span>
                    ))}
                    {(!allergies || allergies.length === 0) && (
                        <span className="text-sm text-slate-400 italic">None logged.</span>
                    )}
                </div>
            </div>
        </div>
    );
}
