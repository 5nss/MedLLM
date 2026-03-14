import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { api } from "@/lib/api";

export function AddPatientModal({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (patient: any) => void }) {
    const [formData, setFormData] = useState({
        name: "",
        dob: "",
        mrn: "",
        gender: "",
        phone: "",
        address: "",
        insurance_provider: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            const newPatient = await api.createPatient(formData);
            onAdd(newPatient);
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3 text-slate-800">
                        <UserPlus size={20} className="text-blue-600" />
                        <h2 className="text-lg font-bold">Add New Patient</h2>
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
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="col-span-2 space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Full Name</label>
                            <input 
                                type="text" 
                                required
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                placeholder="e.g. Jane Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Date of Birth</label>
                            <input 
                                type="date" 
                                required
                                value={formData.dob}
                                onChange={e => setFormData({...formData, dob: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">MRN</label>
                            <input 
                                type="text" 
                                required
                                value={formData.mrn}
                                onChange={e => setFormData({...formData, mrn: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                placeholder="e.g. MRN-123456"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Gender</label>
                            <select 
                                value={formData.gender}
                                onChange={e => setFormData({...formData, gender: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Phone</label>
                            <input 
                                type="tel" 
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                placeholder="(555) 123-4567"
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Address</label>
                            <input 
                                type="text" 
                                value={formData.address}
                                onChange={e => setFormData({...formData, address: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                placeholder="123 Health Ave, City, State ZIP"
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Insurance Provider</label>
                            <input 
                                type="text" 
                                value={formData.insurance_provider}
                                onChange={e => setFormData({...formData, insurance_provider: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                placeholder="e.g. Blue Cross Blue Shield"
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
                            {loading ? "Adding..." : "Add Patient"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
