// Test authentication status
console.log("🔍 Testing authentication status...");

// Check localStorage
const token = localStorage.getItem("jwt");
const userStr = localStorage.getItem("user");

console.log("🔍 Token:", token ? "Present" : "Missing");
console.log("🔍 User data:", userStr);

if (userStr) {
  try {
    const user = JSON.parse(userStr);
    console.log("🔍 Parsed user:", user);
    console.log("🔍 User ID:", user.id);
    console.log("🔍 User role:", user.role);
    console.log("🔍 User name:", user.name);
  } catch (error) {
    console.error("🔍 Error parsing user data:", error);
  }
}

// Test API call
if (token) {
  fetch("http://localhost:8080/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("🔍 API response:", data);
    })
    .catch((error) => {
      console.error("🔍 API error:", error);
    });
} else {
  console.log("🔍 No token found, cannot test API");
}
