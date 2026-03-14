interface MissingQuestion {
    category: string;
    suggested_question: string;
    priority: "high" | "medium" | "low";
}

export function MissingQuestions({ questions }: { questions?: MissingQuestion[] }) {
    return (
        <ul className="space-y-2">
            {questions?.map((q, i) => {
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 mt-0.5 ${iconClass}`}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                        <div>
                            <span className="font-bold block text-xs uppercase mb-1">{q.category}</span>
                            <span>{q.suggested_question}</span>
                        </div>
                    </li>
                );
            })}
            {(!questions || questions.length === 0) && (
                <li className="text-sm text-green-600 font-medium p-3 bg-green-50 rounded-lg border border-green-200">
                    All SAMPLE protocol topics addressed.
                </li>
            )}
        </ul>
    );
}
