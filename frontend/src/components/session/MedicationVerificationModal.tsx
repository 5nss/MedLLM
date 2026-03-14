"use client";

import { AlertTriangle, Check, X, Edit2 } from "lucide-react";

export interface ExtractedMedication {
    medication?: string;
    name?: string;
    dosage?: string;
    frequency?: string;
    [key: string]: any;
}

interface MedicationVerificationModalProps {
    medications: (ExtractedMedication | string)[];
    onApprove: (meds: (ExtractedMedication | string)[]) => void;
    onReject: () => void;
}

export function MedicationVerificationModal({ medications, onApprove, onReject }: MedicationVerificationModalProps) {
    if (!medications || medications.length === 0) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-amber-50 border-b border-amber-100 p-4 flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-amber-900">New Medications Detected</h2>
                        <p className="text-sm text-amber-700">Please verify the following medications extracted from the conversation.</p>
                    </div>
                </div>
                
                <div className="p-6">
                    <div className="space-y-3">
                        {medications.map((med, idx) => {
                            const medName = typeof med === "string" ? med : (med.medication || med.name || "Unknown");
                            const medDose = typeof med === "string" ? "" : (med.dosage || "");
                            const medFreq = typeof med === "string" ? "" : (med.frequency || "");
                            
                            return (
                                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800">{medName}</p>
                                        {(medDose || medFreq) && (
                                            <p className="text-sm text-slate-500 mt-1">
                                                {medDose} {medFreq}
                                            </p>
                                        )}
                                    </div>
                                    <button className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-md transition-colors" title="Edit">
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end gap-3">
                    <button 
                        onClick={onReject}
                        className="px-4 py-2 font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                        <X size={16} /> Reject
                    </button>
                    <button 
                        onClick={() => onApprove(medications)}
                        className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-blue-200"
                    >
                        <Check size={16} /> Approve & Add
                    </button>
                </div>
            </div>
        </div>
    );
}
