// Test script for the chat API
const axios = require("axios");

const API_BASE_URL = "http://localhost:8080";

async function testChatAPI() {
  console.log("🧪 Testing Chat API...\n");

  try {
    // Test 1: Check if server is running
    console.log("1. Testing server connection...");
    const healthCheck = await axios.get(`${API_BASE_URL}/`);
    console.log("✅ Server is running:", healthCheck.data);
    console.log("");

    // Test 2: Test chat endpoint without API key (should fail gracefully)
    console.log("2. Testing chat endpoint without API key...");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: "Hello, how can I report illegal construction?",
      });
      console.log("✅ Chat API response:", response.data);
    } catch (error) {
      if (
        error.response?.status === 500 &&
        (error.response?.data?.error?.includes("not configured") ||
          error.response?.data?.error?.includes("AI is unavailable"))
      ) {
        console.log(
          "✅ Expected error (no API key):",
          error.response.data.error
        );
      } else {
        console.log(
          "❌ Unexpected error:",
          error.response?.data || error.message
        );
      }
    }
    console.log("");

    // Test 3: Test with invalid message format
    console.log("3. Testing invalid message format...");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: 123, // Invalid: should be string
      });
      console.log("❌ Should have failed with invalid message format");
    } catch (error) {
      if (error.response?.status === 400) {
        console.log("✅ Correctly rejected invalid message format");
      } else {
        console.log(
          "❌ Unexpected error:",
          error.response?.data || error.message
        );
      }
    }
    console.log("");

    // Test 4: Test with empty message
    console.log("4. Testing empty message...");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: "",
      });
      console.log("❌ Should have failed with empty message");
    } catch (error) {
      if (error.response?.status === 400) {
        console.log("✅ Correctly rejected empty message");
      } else {
        console.log(
          "❌ Unexpected error:",
          error.response?.data || error.message
        );
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.log("💡 Make sure the backend server is running on port 8080");
    }
  }
}

console.log("🚀 Starting Chat API Tests...\n");
testChatAPI();
