"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { UserPlus, Calendar, CreditCard, X } from "lucide-react";

interface NewPatientFormProps {
    onSuccess: (patientId: string) => void;
    onCancel: () => void;
    initialQuery?: string;
}

export function NewPatientForm({ onSuccess, onCancel, initialQuery = "" }: NewPatientFormProps) {
    const [name, setName] = useState(initialQuery);
    const [dob, setDob] = useState("");
    const [mrn, setMrn] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const patient = await api.createPatient({ name, dob, mrn });
            onSuccess(patient.id);
        } catch (err: any) {
            setError(err.message || "Failed to create patient");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-blue-200 shadow-md rounded-xl p-6 mt-4 relative">
            <button
                onClick={onCancel}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
                <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <UserPlus size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Create New Patient</h3>
                    <p className="text-sm text-slate-500">Add a new patient record to start an intake session.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                        required
                        type="text"
                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. Jane Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1">
                            <Calendar size={14} /> Date of Birth
                        </label>
                        <input
                            required
                            type="date"
                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1">
                            <CreditCard size={14} /> Medical Record Number (MRN)
                        </label>
                        <input
                            required
                            type="text"
                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                            placeholder="e.g. MRN-1234"
                            value={mrn}
                            onChange={(e) => setMrn(e.target.value)}
                        />
                    </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Saving..." : "Create Patient"}
                    </button>
                </div>
            </form>
        </div>
    );
}
