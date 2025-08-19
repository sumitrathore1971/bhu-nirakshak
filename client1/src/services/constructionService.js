import { getApiBaseUrl } from "../lib/utils.js";

const API_BASE_URL = getApiBaseUrl();

class ConstructionService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/construction`;
  }

  getAuthToken() {
    return localStorage.getItem("jwt") || localStorage.getItem("token");
  }

  getAuthHeaders(json = true) {
    const token = this.getAuthToken();
    const base = json ? { "Content-Type": "application/json" } : {};
    return {
      ...base,
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async apply({ polygon, files = {} }) {
    const token = this.getAuthToken();
    if (!token) throw new Error("Login required");

    const form = new FormData();
    form.append("plotCoordinates", JSON.stringify(polygon));
    if (files.sitePlan) form.append("sitePlan", files.sitePlan);
    if (files.ownershipDocs) form.append("ownershipDocs", files.ownershipDocs);
    if (files.architectPlan) form.append("architectPlan", files.architectPlan);

    const res = await fetch(`${this.baseURL}/apply`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to apply");
    return data?.data?.plan || data;
  }

  async myApplications() {
    const res = await fetch(`${this.baseURL}/my`, {
      headers: this.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to fetch");
    return data?.data?.plans || [];
  }

  async listAll(params = {}) {
    const qp = new URLSearchParams(params).toString();
    const res = await fetch(`${this.baseURL}?${qp}`, {
      headers: this.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to fetch");
    return data?.data || data;
  }

  async getById(id) {
    const res = await fetch(`${this.baseURL}/${id}`, { headers: this.getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to fetch");
    return data?.data?.plan || data;
  }

  async revenueVerify(id, { status, note }) {
    const res = await fetch(`${this.baseURL}/${id}/revenue-verify`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to update");
    return data?.data?.plan || data;
  }

  async urbanVerify(id, { status, note }) {
    const res = await fetch(`${this.baseURL}/${id}/urban-verify`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to update");
    return data?.data?.plan || data;
  }

  async flagSuspicious(id, note = "") {
    const res = await fetch(`${this.baseURL}/${id}/flag`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to flag");
    return data?.data?.plan || data;
  }

  async forwardToRevenue(id, note = "") {
    const res = await fetch(`${this.baseURL}/${id}/forward-revenue`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to forward to revenue");
    return data?.data?.plan || data;
  }

  async siteInspect(id, { report, status, officer, scheduledAt, completedAt, photos = [] }) {
    const token = this.getAuthToken();
    if (!token) throw new Error("Login required");
    const form = new FormData();
    if (report) form.append("report", report);
    if (status) form.append("status", status);
    if (officer) form.append("officer", officer);
    if (scheduledAt) form.append("scheduledAt", scheduledAt);
    if (completedAt) form.append("completedAt", completedAt);
    photos.forEach((p) => form.append("photos", p));
    const res = await fetch(`${this.baseURL}/${id}/site-inspect`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to update");
    return data?.data?.plan || data;
  }

  async finalize(id, status) {
    const res = await fetch(`${this.baseURL}/${id}/finalize`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to finalize");
    return data?.data?.plan || data;
  }
}

export default new ConstructionService();


