import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Create axios instance with default config
const chatAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token if available
chatAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
chatAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Chat API Error:", error);

    // Handle specific error cases
    if (error.response?.status === 429) {
      throw new Error(
        "AI service is temporarily unavailable due to high usage. Please try again later."
      );
    }

    if (error.response?.status === 500) {
      throw new Error(
        error.response.data?.error || "AI is unavailable, please try later."
      );
    }

    if (error.code === "ECONNABORTED") {
      throw new Error("Request timed out. Please try again.");
    }

    if (!error.response) {
      throw new Error("Network error. Please check your connection.");
    }

    throw new Error(
      error.response.data?.error || "An unexpected error occurred."
    );
  }
);

export const chatService = {
  /**
   * Send a message to the AI chatbot
   * @param {string} message - The user's message
   * @returns {Promise<Object>} - The AI response
   */
  sendMessage: async (message) => {
    try {
      const response = await chatAPI.post("/api/chat", { message });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Test the chat API connection
   * @returns {Promise<boolean>} - True if connection is successful
   */
  testConnection: async () => {
    try {
      await chatAPI.get("/");
      return true;
    } catch (error) {
      console.error("Chat API connection test failed:", error);
      return false;
    }
  },
};

export default chatService;
