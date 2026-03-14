"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Calendar, BarChart, FileText, Search, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { AddPatientModal } from "@/components/patients/AddPatientModal";

export default function PatientsDashboard() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchPatients = async (query = "") => {
    setLoading(true);
    try {
      const data = await api.getPatients(query);
      setPatients(data);
    } catch (err) {
      console.error("Failed to fetch patients", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients(searchQuery);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">M</div>
          <span className="font-bold text-xl text-slate-800">MedDash Pro</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
            <Users size={20} /> Patient Lobby
          </Link>
          <Link href="/patients" className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-lg font-medium">
            <FileText size={20} /> Patient Records
          </Link>
          <Link href="/appointments" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
            <Calendar size={20} /> Appointments
          </Link>
          <Link href="/analytics" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
            <BarChart size={20} /> Analytics
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Patient Records</h1>
            <p className="text-sm text-slate-500 mt-1">Manage all patient profiles and history</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={18} /> New Patient
          </button>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {/* Search bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <Search className="absolute left-4 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by patient name or MRN..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-3 bg-slate-900 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
                <div className="col-span-full py-12 text-center text-slate-500 font-medium">Loading patients...</div>
            ) : patients.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200 border-dashed">
                  No patients found. Create one using the "New Patient" button above.
                </div>
            ) : (
                patients.map(patient => (
                  <Link href={`/patients/${patient.id}`} key={patient.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg group-hover:bg-blue-100 transition-colors">
                        {patient.name.charAt(0)}
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        {patient.mrn}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{patient.name}</h3>
                      <p className="text-slate-500 text-sm mb-4">DOB: {patient.dob} {patient.gender ? `• ${patient.gender}` : ''}</p>
                      
                      <div className="flex items-center text-blue-600 text-sm font-semibold">
                        View Details <span className="ml-1 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all">→</span>
                      </div>
                    </div>
                  </Link>
                ))
            )}
          </div>
        </div>
      </main>

      <AddPatientModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={(newPatient) => setPatients(prev => [newPatient, ...prev])} 
      />
    </div>
  );
}
