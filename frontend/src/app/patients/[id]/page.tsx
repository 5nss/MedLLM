"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Users, Calendar, BarChart, FileText, ArrowLeft, Clock, FileCheck } from "lucide-react";
import { api } from "@/lib/api";
import { PatientDetailsCard } from "@/components/patients/PatientDetailsCard";

export default function PatientDetailView() {
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        if (!id) return;
        const data = await api.getPatient(id as string);
        setPatient(data);
      } catch (err) {
        console.error("Failed to fetch patient", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500">Loading patient data...</div>;
  }

  if (!patient) {
    return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500">Patient not found.</div>;
  }

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
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center shadow-sm z-10 gap-4">
          <Link href="/patients" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Patient Profile</h1>
            <p className="text-sm text-slate-500 mt-1">Detailed patient information and clinical history</p>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 max-w-5xl mx-auto w-full space-y-8">
          <PatientDetailsCard patient={patient} />
          
          {/* History/Sessions Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4 flex gap-6">
              <button className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-4 -mb-4 px-2">Clinical Sessions</button>
              <button className="text-slate-500 font-medium hover:text-slate-700 pb-4 -mb-4 px-2 transition-colors">Appointments</button>
            </div>
            <div className="p-6">
              <div className="text-center py-10 border border-slate-200 border-dashed rounded-lg bg-slate-50">
                <FileCheck size={32} className="mx-auto text-slate-300 mb-3" />
                <h3 className="text-sm font-semibold text-slate-700">No previous clinical sessions</h3>
                <p className="text-xs text-slate-500 mt-1">Start a new session to begin recording clinical history.</p>
                <Link 
                    href={`/intake/new?patientId=${patient.id}`}
                    className="inline-block mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                    Start Session →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
