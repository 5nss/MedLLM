"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Calendar as CalendarIcon, BarChart, FileText, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { ScheduleAppointmentModal } from "@/components/appointments/ScheduleAppointmentModal";

export default function AppointmentsDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  
  // Basic date handling for the calendar grid
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Parallel fetch appointments and patients
      const [aptData, patData] = await Promise.all([
        api.getAppointments(),
        api.getPatients()
      ]);
      
      const patMap = patData.reduce((acc: any, p: any) => ({...acc, [p.id]: p}), {});
      setPatients(patMap);
      setAppointments(aptData);
    } catch (err) {
      console.error("Failed to fetch scheduling data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Calendar logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday
  
  const generateCalendarGrid = () => {
    const days = [];
    // Padding for start of month
    for (let i = 0; i < startDayOfMonth; i++) {
        days.push(null);
    }
    // Days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }
    return days;
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Group appointments by date string (YYYY-MM-DD)
  const appointmentsByDate = appointments.reduce((acc, apt) => {
      const dateStr = new Date(apt.start_time).toISOString().split('T')[0];
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(apt);
      return acc;
  }, {} as Record<string, any[]>);

  const formatTime = (isoString: string) => {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
          <Link href="/patients" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
            <FileText size={20} /> Patient Records
          </Link>
          <Link href="/appointments" className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-lg font-medium">
            <CalendarIcon size={20} /> Appointments
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
            <h1 className="text-2xl font-bold text-slate-800">Appointments Hub</h1>
            <p className="text-sm text-slate-500 mt-1">Schedule and manage clinic visits</p>
          </div>
          <button 
            onClick={() => setIsScheduleOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={18} /> Schedule Appointment
          </button>
        </header>

        <div className="flex-1 overflow-auto p-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full max-w-6xl mx-auto">
                {/* Calendar Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-2xl font-bold text-slate-800">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={prevMonth} className="p-2 border border-slate-200 rounded-lg hover:bg-white bg-slate-50 text-slate-600 transition-colors shadow-sm">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-white bg-slate-50 text-slate-700 font-medium transition-colors shadow-sm">
                            Today
                        </button>
                        <button onClick={nextMonth} className="p-2 border border-slate-200 rounded-lg hover:bg-white bg-slate-50 text-slate-600 transition-colors shadow-sm">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Weekdays */}
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                    {weekdays.map(day => (
                        <div key={day} className="py-3 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-slate-200 gap-px">
                    {generateCalendarGrid().map((dayNum, idx) => {
                        const isToday = dayNum === new Date().getDate() && 
                                        currentDate.getMonth() === new Date().getMonth() && 
                                        currentDate.getFullYear() === new Date().getFullYear();
                        
                        const dateCode = dayNum ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}` : null;
                        const dayApts = dateCode ? (appointmentsByDate[dateCode] || []) : [];

                        return (
                            <div key={idx} className={`bg-white min-h-[120px] p-2 overflow-y-auto ${!dayNum ? 'bg-slate-50/50' : ''}`}>
                                {dayNum && (
                                    <>
                                        <div className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-2 ${isToday ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700'}`}>
                                            {dayNum}
                                        </div>
                                        <div className="space-y-1.5">
                                            {dayApts.map((apt: any) => (
                                                <div key={apt.id} className="text-xs p-1.5 rounded bg-blue-50 border border-blue-100 text-blue-800 leading-tight group relative cursor-pointer hover:bg-blue-100 transition-colors">
                                                    <span className="font-semibold block">{formatTime(apt.start_time)}</span>
                                                    <span className="truncate block opacity-90">{patients[apt.patient_id]?.name || "Loading..."}</span>
                                                    
                                                    {/* Tooltip on hover */}
                                                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white p-2.5 rounded-lg shadow-xl pointer-events-none text-left">
                                                        <p className="font-bold">{patients[apt.patient_id]?.name}</p>
                                                        <p className="text-slate-300 mt-0.5">{apt.reason}</p>
                                                        <p className="text-blue-300 mt-1">{formatTime(apt.start_time)} - {formatTime(apt.end_time)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </main>

      <ScheduleAppointmentModal 
        isOpen={isScheduleOpen} 
        onClose={() => setIsScheduleOpen(false)} 
        onSchedule={(newApt) => setAppointments(prev => [...prev, newApt])}
      />
    </div>
  );
}
