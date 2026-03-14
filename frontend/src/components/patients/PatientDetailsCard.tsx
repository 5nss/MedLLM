import { UserRound, Phone, MapPin, Shield } from "lucide-react";
import Link from "next/link";

export function PatientDetailsCard({ patient }: { patient: any }) {
    if (!patient) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                        {patient.name?.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{patient.name}</h2>
                        <p className="text-slate-500 font-medium mt-1">MRN: {patient.mrn}</p>
                    </div>
                </div>
                <Link 
                    href={`/intake/new?patientId=${patient.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    Start Session
                </Link>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-600">
                        <UserRound size={18} className="text-slate-400" />
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Demographics</p>
                            <p className="font-medium text-slate-800">
                                {patient.gender || "Not specified"} • DOB: {patient.dob}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-slate-600">
                        <Phone size={18} className="text-slate-400" />
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</p>
                            <p className="font-medium text-slate-800">{patient.phone || "No phone number"}</p>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-600">
                        <MapPin size={18} className="text-slate-400" />
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Address</p>
                            <p className="font-medium text-slate-800">{patient.address || "No address provided"}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-slate-600">
                        <Shield size={18} className="text-slate-400" />
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Insurance</p>
                            <p className="font-medium text-slate-800">{patient.insurance_provider || "Self-pay"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
