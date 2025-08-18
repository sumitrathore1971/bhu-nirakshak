import { getApiBaseUrl } from '../lib/utils.js';

// Use the utility function to get the API base URL
const API_BASE_URL = getApiBaseUrl();

class ReportService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage - Fixed to match AuthContext
  getAuthToken() {
    return localStorage.getItem("jwt") || localStorage.getItem("token");
  }

  // Get auth headers
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Submit a new report
  async submitReport(reportData, files = []) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error(
          "Authentication required. Please log in to submit a report."
        );
      }

      for (let attempt = 0; attempt < 2; attempt++) {
        // Create FormData for file upload
        const formData = new FormData();
        
        // Add report data as JSON string
        formData.append('reportData', JSON.stringify(reportData));
        
        // Add files
        files.forEach((file, index) => {
          formData.append('media', file);
        });

        const response = await fetch(`${this.baseURL}/reports`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type, let browser set it with boundary for FormData
          },
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          return data;
        }

        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          throw new Error(
            "Access denied. You do not have permission to submit reports."
          );
        }

        const message = data?.message || "";
        const isIdAllocationIssue =
          message.includes("Report ID already exists") ||
          message.includes("Failed to allocate a unique Report ID") ||
          message.includes("Temporary ID generation conflict");

        if (isIdAllocationIssue && attempt === 0) {
          // brief backoff then retry once
          await new Promise((resolve) => setTimeout(resolve, 150));
          continue;
        }

        throw new Error(message || "Failed to submit report");
      }

      // Should not reach here
      throw new Error("Failed to submit report");
    } catch (error) {
      console.error("Error submitting report:", error);
      throw error;
    }
  }

  // Get user's reports
  async getMyReports(page = 1, limit = 10, status = null) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error(
          "Authentication required. Please log in to view your reports."
        );
      }

      let url = `${this.baseURL}/reports/my-reports?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          throw new Error(
            "Access denied. You do not have permission to view reports."
          );
        }
        throw new Error(data.message || "Failed to fetch reports");
      }

      // Handle new response format
      if (data.success && data.data) {
        return data.data;
      }

      // Fallback for old format
      return data;
    } catch (error) {
      console.error("Error fetching my reports:", error);
      throw error;
    }
  }

  // Get a single report by ID
  async getReportById(reportId) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error(
          "Authentication required. Please log in to view report details."
        );
      }

      const response = await fetch(`${this.baseURL}/reports/${reportId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          throw new Error(
            "Access denied. You do not have permission to view this report."
          );
        } else if (response.status === 404) {
          throw new Error("Report not found.");
        }
        throw new Error(data.message || "Failed to fetch report");
      }

      // Handle new response format
      if (data.success && data.data) {
        return data.data;
      }

      // Fallback for old format
      return data;
    } catch (error) {
      console.error("Error fetching report:", error);
      throw error;
    }
  }

  // Update report status (for enforcement/admin)
  async updateReportStatus(reportId, status, notes = null) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error(
          "Authentication required. Please log in to update report status."
        );
      }

      const updateData = { status };
      if (notes) {
        updateData.notes = notes;
      }

      const response = await fetch(
        `${this.baseURL}/reports/${reportId}/status`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          throw new Error(
            "Access denied. You do not have permission to update report status."
          );
        }
        throw new Error(data.message || "Failed to update report status");
      }

      return data;
    } catch (error) {
      console.error("Error updating report status:", error);
      throw error;
    }
  }

  // Add note to report
  async addNoteToReport(reportId, content, isInternal = false) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Authentication required. Please log in to add notes.");
      }

      const response = await fetch(
        `${this.baseURL}/reports/${reportId}/notes`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ content, isInternal }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          throw new Error(
            "Access denied. You do not have permission to add notes."
          );
        }
        throw new Error(data.message || "Failed to add note");
      }

      return data;
    } catch (error) {
      console.error("Error adding note:", error);
      throw error;
    }
  }

  // Get all reports (admin only)
  async getAllReports(page = 1, limit = 10, filters = {}) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error(
          "Authentication required. Please log in to view all reports."
        );
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });

      const response = await fetch(`${this.baseURL}/reports?${queryParams}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          throw new Error("Access denied. Admin privileges required.");
        }
        throw new Error(data.message || "Failed to fetch reports");
      }

      // Handle new response format
      if (data.success && data.data) {
        return data;
      }

      // Fallback for old format
      return data;
    } catch (error) {
      console.error("Error fetching all reports:", error);
      throw error;
    }
  }

  // Get report statistics (admin/enforcement only)
  async getReportStats() {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error(
          "Authentication required. Please log in to view statistics."
        );
      }

      const response = await fetch(`${this.baseURL}/reports/stats/overview`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          throw new Error(
            "Access denied. Admin/Enforcement privileges required."
          );
        }
        throw new Error(data.message || "Failed to fetch statistics");
      }

      return data;
    } catch (error) {
      console.error("Error fetching report statistics:", error);
      throw error;
    }
  }

  // Assign report to enforcement officer (admin only)
  async assignReport(reportId, assignedTo) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error(
          "Authentication required. Please log in to assign reports."
        );
      }

      const response = await fetch(
        `${this.baseURL}/reports/${reportId}/assign`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ assignedTo }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          throw new Error("Access denied. Admin privileges required.");
        }
        throw new Error(data.message || "Failed to assign report");
      }

      return data;
    } catch (error) {
      console.error("Error assigning report:", error);
      throw error;
    }
  }

  // Upload media files (placeholder for future implementation)
  async uploadMedia(files) {
    // This would be implemented when file upload functionality is added
    // For now, return a mock response
    return {
      uploaded: true,
      files: files.map((file) => ({
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
      })),
    };
  }

  // Validate report data before submission
  validateReportData(data) {
    const errors = [];

    if (!data.fullName?.trim()) {
      errors.push("Full name is required");
    }

    if (!data.phone?.trim()) {
      errors.push("Phone number is required");
    } else if (!/^[0-9]{10}$/.test(data.phone.trim())) {
      errors.push("Phone number must be 10 digits");
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("Invalid email format");
    }

    if (!data.title?.trim()) {
      errors.push("Report title is required");
    }

    if (!data.description?.trim()) {
      errors.push("Description is required");
    }

    if (!data.category) {
      errors.push("Category is required");
    }

    if (!data.date) {
      errors.push("Date of observation is required");
    }

    const latOk = Number.isFinite(data.location?.lat);
    const lngOk = Number.isFinite(data.location?.lng);
    if (!latOk || !lngOk) {
      errors.push("Location coordinates are required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getAuthToken();
  }

  // Delete a report
  async deleteReport(reportId) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error(
          "Authentication required. Please log in to delete reports."
        );
      }

      const response = await fetch(`${this.baseURL}/reports/${reportId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          throw new Error(
            "Access denied. You can only delete your own reports."
          );
        } else if (response.status === 404) {
          throw new Error("Report not found.");
        }
        throw new Error(data.message || "Failed to delete report");
      }

      return data;
    } catch (error) {
      console.error("Error deleting report:", error);
      throw error;
    }
  }

  // Get current user info (if available)
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }
}

export default new ReportService();
