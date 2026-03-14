const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = {
    getPatients: async (search?: string) => {
        const url = search
            ? `${API_URL}/api/patients?search=${encodeURIComponent(search)}`
            : `${API_URL}/api/patients`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch patients");
        return res.json();
    },

    getPatient: async (id: string) => {
        const res = await fetch(`${API_URL}/api/patients/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch patient");
        return res.json();
    },

    createPatient: async (data: { name: string; dob: string; mrn: string }) => {
        const res = await fetch(`${API_URL}/api/patients`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Failed to create patient");
        }
        return res.json();
    },

    createSession: async (patientId: string) => {
        const res = await fetch(`${API_URL}/api/sessions/${patientId}`, {
            method: "POST",
        });
        if (!res.ok) throw new Error("Failed to create session");
        return res.json();
    },

    getActiveSessions: async () => {
        const res = await fetch(`${API_URL}/api/sessions`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch sessions");
        return res.json();
    },

    getSession: async (id: string) => {
        const res = await fetch(`${API_URL}/api/sessions/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch session");
        return res.json();
    },

    // Appointments
    getAppointments: async () => {
        const res = await fetch(`${API_URL}/api/appointments`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch appointments");
        return res.json();
    },

    createAppointment: async (data: any) => {
        const res = await fetch(`${API_URL}/api/appointments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Failed to schedule appointment");
        }
        return res.json();
    },

    // Analytics
    getAnalytics: async () => {
        const res = await fetch(`${API_URL}/api/analytics/dashboard`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch analytics");
        return res.json();
    }
};
