import { useState, useEffect } from "react";
import { X, CalendarPlus } from "lucide-react";
import { api } from "@/lib/api";

export function ScheduleAppointmentModal({ isOpen, onClose, onSchedule }: { isOpen: boolean, onClose: () => void, onSchedule: (appointment: any) => void }) {
    const [patients, setPatients] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        patient_id: "",
        date: "",
        time: "",
        duration: "30",
        reason: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            api.getPatients("")
                .then(data => setPatients(data))
                .catch(err => console.error("Failed to fetch patients", err));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            // Compute start and end ISO strings based on date/time and duration
            const startDateTime = new Date(`${formData.date}T${formData.time}`);
            const endDateTime = new Date(startDateTime.getTime() + parseInt(formData.duration) * 60000);

            const payload = {
                patient_id: formData.patient_id,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                status: "scheduled",
                reason: formData.reason
            };

            const newAppointment = await api.createAppointment(payload);
            onSchedule(newAppointment);
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3 text-slate-800">
                        <CalendarPlus size={20} className="text-blue-600" />
                        <h2 className="text-lg font-bold">Schedule Appointment</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4 mb-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Select Patient</label>
                            <select 
                                required
                                value={formData.patient_id}
                                onChange={e => setFormData({...formData, patient_id: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
                            >
                                <option value="" disabled>Select a patient</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} (MRN: {p.mrn})</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Date</label>
                                <input 
                                    type="date" 
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({...formData, date: e.target.value})}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Start Time</label>
                                <input 
                                    type="time" 
                                    required
                                    value={formData.time}
                                    onChange={e => setFormData({...formData, time: e.target.value})}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Duration (Minutes)</label>
                            <select 
                                value={formData.duration}
                                onChange={e => setFormData({...formData, duration: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
                            >
                                <option value="15">15 Minutes</option>
                                <option value="30">30 Minutes</option>
                                <option value="45">45 Minutes</option>
                                <option value="60">1 Hour</option>
                            </select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Reason for Visit</label>
                            <input 
                                type="text" 
                                required
                                value={formData.reason}
                                onChange={e => setFormData({...formData, reason: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                placeholder="e.g. Annual Checkup, Cough and Fever..."
                            />
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className={`px-5 py-2.5 font-medium text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {loading ? "Scheduling..." : "Schedule Appointment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
