const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const api = {
    getPatients: async (search?: string) => {
        const url = search
            ? `${API_URL}/api/patients?search=${encodeURIComponent(search)}`
            : `${API_URL}/api/patients`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch patients");
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
    }
};
