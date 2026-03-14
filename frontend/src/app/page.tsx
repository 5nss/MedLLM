"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  BarChart,
  FileText,
  Activity,
  Clock,
  CheckCircle2
} from "lucide-react";
import { api } from "@/lib/api";
import { PatientSearch } from "@/components/lobby/PatientSearch";

export default function PatientLobby() {
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const data = await api.getActiveSessions();
      setActiveSessions(data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // Poll every 10 seconds for lobby updates
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-blue-100 text-blue-700 border-blue-200";
      case "waiting": return "bg-orange-100 text-orange-700 border-orange-200";
      case "review": return "bg-purple-100 text-purple-700 border-purple-200";
      case "completed": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Helper to calculate age from dob string YYYY-MM-DD
  const calculateAge = (dob: string) => {
    if (!dob) return "?";
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    return Math.floor(difference / (1000 * 60 * 60 * 24 * 365.25));
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
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-lg font-medium">
            <Users size={20} /> Patient Lobby
          </Link>
          <Link href="/patients" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
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
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Central Clinic</h1>
            <p className="text-sm text-slate-500 mt-1">General Practice • 68% Capacity Reached</p>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8">

          <PatientSearch />

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-slate-500 mb-2">
                <Users size={18} /> <h3 className="font-medium">Total Waiting</h3>
              </div>
              <p className="text-3xl font-bold text-slate-800">0</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-slate-500 mb-2">
                <Activity size={18} /> <h3 className="font-medium">Active Sessions</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">{activeSessions.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-slate-500 mb-2">
                <Clock size={18} /> <h3 className="font-medium">Avg. Wait Time</h3>
              </div>
              <p className="text-3xl font-bold text-orange-500">-</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-slate-500 mb-2">
                <CheckCircle2 size={18} /> <h3 className="font-medium">Ready for Discharge</h3>
              </div>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Active Patient Sessions</h2>
              <span className="text-sm font-medium text-slate-500">Showing {activeSessions.length} past/active sessions</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm font-medium border-b border-slate-200">
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">MRN</th>
                    <th className="px-6 py-4">Age/Gender</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        Loading active sessions...
                      </td>
                    </tr>
                  )}
                  {!loading && activeSessions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No active sessions today. Use the search bar above to start one.
                      </td>
                    </tr>
                  )}
                  {!loading && activeSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase">
                            {session.patient?.name?.charAt(0) || '?'}
                          </div>
                          <span className="font-semibold text-slate-800">{session.patient?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-sm">{session.patient?.mrn || 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {calculateAge(session.patient?.dob)}y
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(session.status)} capitalize`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/intake/${session.id}`} className="text-blue-600 font-medium hover:text-blue-800 hover:underline text-sm">
                          Resume Session
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
