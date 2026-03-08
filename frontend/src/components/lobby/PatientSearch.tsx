"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, Loader2, Play } from "lucide-react";
import { api } from "@/lib/api";
import { NewPatientForm } from "./NewPatientForm";

export function PatientSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showNewPatientForm, setShowNewPatientForm] = useState(false);
    const [creatingSessionFor, setCreatingSessionFor] = useState<string | null>(null);
    const router = useRouter();

    // Debounced search effect
    useEffect(() => {
        if (query.trim().length === 0) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const data = await api.getPatients(query);
                setResults(data);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleStartSession = async (patientId: string) => {
        try {
            setCreatingSessionFor(patientId);
            const session = await api.createSession(patientId);
            router.push(`/intake/${session.id}`);
        } catch (err) {
            console.error("Failed to start session:", err);
            setCreatingSessionFor(null);
        }
    };

    const handleCreatePatientSuccess = (patientId: string) => {
        setShowNewPatientForm(false);
        handleStartSession(patientId);
    };

    if (showNewPatientForm) {
        return (
            <NewPatientForm
                onSuccess={handleCreatePatientSuccess}
                onCancel={() => setShowNewPatientForm(false)}
                initialQuery={query}
            />
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="p-1">
                <div className="relative flex items-center p-3 border-b border-slate-100 bg-slate-50/50">
                    <Search className="absolute left-6 text-blue-500" size={20} />
                    <input
                        type="text"
                        className="w-full bg-transparent border-none py-2 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:ring-0 text-lg outline-none"
                        placeholder="Search active patients by name or MRN to start a session..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {isSearching && <Loader2 className="absolute right-6 animate-spin text-slate-400" size={20} />}
                </div>

                {query && results.length > 0 && (
                    <div className="max-h-80 overflow-y-auto p-2">
                        {results.map((patient) => (
                            <div key={patient.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg group transition-colors border border-transparent hover:border-slate-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                        {patient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{patient.name}</h4>
                                        <span className="text-sm text-slate-500 font-mono">{patient.mrn} • {patient.dob}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleStartSession(patient.id)}
                                    disabled={creatingSessionFor === patient.id}
                                    className="bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-4 py-2 flex items-center gap-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                                >
                                    {creatingSessionFor === patient.id ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Play size={16} />
                                    )}
                                    Start Session
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {query && results.length === 0 && !isSearching && (
                    <div className="p-8 text-center bg-slate-50 m-2 rounded-lg border border-dashed border-slate-300">
                        <p className="text-slate-600 mb-4">No patients found matching "<strong>{query}</strong>"</p>
                        <button
                            onClick={() => setShowNewPatientForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors"
                        >
                            <UserPlus size={18} /> Add New Patient Record
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
