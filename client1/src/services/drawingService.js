const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:8080/api";

class DrawingService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/drawings`;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem("jwt");
  }

  // Get auth headers
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // Get all drawings for the current user
  async getDrawings() {
    try {
      const response = await fetch(this.baseURL, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching drawings:", error);
      throw error;
    }
  }

  // Get a specific drawing by ID
  async getDrawing(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching drawing:", error);
      throw error;
    }
  }

  // Save a new drawing
  async saveDrawing(drawingData) {
    try {
      const response = await fetch(this.baseURL, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(drawingData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error saving drawing:", error);
      throw error;
    }
  }

  // Update an existing drawing
  async updateDrawing(id, drawingData) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(drawingData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating drawing:", error);
      throw error;
    }
  }

  // Delete a drawing (soft delete)
  async deleteDrawing(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting drawing:", error);
      throw error;
    }
  }

  // Get drawing statistics
  async getDrawingStats() {
    try {
      const response = await fetch(`${this.baseURL}/stats/summary`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching drawing stats:", error);
      throw error;
    }
  }
}

export default new DrawingService();
