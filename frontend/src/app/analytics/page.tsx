"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Calendar, BarChart as BarChartIcon, FileText, Activity, Clock, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, PieChart, Pie, Cell 
} from "recharts";

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const raw = await api.getAnalytics();
        setData(raw);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

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
          <Link href="/patients" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
            <FileText size={20} /> Patient Records
          </Link>
          <Link href="/appointments" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
            <Calendar size={20} /> Appointments
          </Link>
          <Link href="/analytics" className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-lg font-medium">
            <BarChartIcon size={20} /> Analytics
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Clinic Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">Key performance indicators and patient trends</p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 border border-blue-100 shadow-sm">
            <Activity size={16} /> Live Data Sync
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
            {loading ? (
                <div className="flex items-center justify-center h-full text-slate-500 font-medium">Gathering insights...</div>
            ) : !data ? (
                <div className="flex items-center justify-center h-full text-slate-500 font-medium">Analytics unavailable.</div>
            ) : (
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* KPI High-level Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-500 mb-1">Total Patients</p>
                                <h3 className="text-3xl font-bold text-slate-800">{data.stats?.total_patients || 0}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <Users size={24} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-500 mb-1">30-Day Appts</p>
                                <h3 className="text-3xl font-bold text-slate-800">{data.stats?.total_appointments_last_30d || 0}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                <Calendar size={24} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-500 mb-1">Session Completion</p>
                                <h3 className="text-3xl font-bold text-slate-800">{data.stats?.completion_rate || 0}%</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                <ShieldCheck size={24} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-500 mb-1">Total Intakes</p>
                                <h3 className="text-3xl font-bold text-slate-800">{data.stats?.total_sessions_last_30d || 0}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                                <Clock size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* 14 Day Trend Chart */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Activity size={20} className="text-blue-500" /> Waitroom Volume (14 Days)
                            </h3>
                            <div className="h-[300px] w-full">
                                {data.trend && data.trend.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={data.trend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Line type="monotone" dataKey="sessions" stroke="#2563eb" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6, strokeWidth: 0}} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400 font-medium border border-dashed border-slate-200 rounded-xl">No trend data calculated yet</div>
                                )}
                            </div>
                        </div>

                        {/* Top Symptoms */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <BarChartIcon size={20} className="text-purple-500" /> Top Recorded Complaints
                            </h3>
                            <div className="h-[300px] w-full">
                                {data.symptoms && data.symptoms.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.symptoms} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                            <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                            <YAxis dataKey="symptom" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12}} width={100} />
                                            <Tooltip 
                                                cursor={{fill: '#f8fafc'}}
                                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                                {data.symptoms.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400 font-medium border border-dashed border-slate-200 rounded-xl">Enough data not captured to aggregate symptoms</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
