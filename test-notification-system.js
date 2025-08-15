const io = require("socket.io-client");

// Test the notification system
async function testNotificationSystem() {
  console.log("🧪 Testing notification system...\n");

  // Connect to socket server
  const socket = io("http://localhost:8080", {
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("✅ Connected to Socket.io server");

    // Join admin room
    socket.emit("join-admin");
    console.log("👨‍💼 Joined admin notification room");
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected from Socket.io server");
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error);
  });

  // Listen for new report notifications
  socket.on("newReport", (data) => {
    console.log("📢 Received new report notification:");
    console.log("   Type:", data.type);
    console.log("   Report ID:", data.report?.reportId);
    console.log("   Title:", data.report?.title);
    console.log("   Reporter:", data.report?.reporter?.fullName);
    console.log("   Category:", data.report?.category);
    console.log("   Status:", data.report?.status);
    console.log("   Timestamp:", data.timestamp);
    console.log("✅ Notification system is working!\n");
  });

  // Test report submission via API
  console.log("📝 Testing report submission...");

  try {
    // First, we need to get a valid JWT token by logging in
    const loginResponse = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "citizen@example.com", // Replace with actual test user
        password: "password123", // Replace with actual test password
      }),
    });

    if (!loginResponse.ok) {
      console.log(
        "⚠️  Could not login with test credentials. Please ensure you have a test citizen user."
      );
      console.log(
        "   You can create one by registering a new citizen account."
      );
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    console.log("✅ Logged in successfully");

    // Submit a test report
    const reportResponse = await fetch("http://localhost:8080/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fullName: "Test Citizen",
        phone: "1234567890",
        email: "test@example.com",
        title: "Test Report - Unauthorized Construction",
        description:
          "This is a test report to verify the notification system is working properly.",
        category: "Unauthorized Construction",
        date: new Date().toISOString(),
        location: {
          lat: 22.7196,
          lng: 75.8577,
          address: "Test Location, Indore",
          area: "Test Area",
        },
      }),
    });

    if (reportResponse.ok) {
      const reportData = await reportResponse.json();
      console.log("✅ Report submitted successfully");
      console.log("   Report ID:", reportData.report?.reportId);
      console.log("   Status:", reportData.success);
    } else {
      const errorData = await reportResponse.json();
      console.log("❌ Failed to submit report:", errorData.message);
    }
  } catch (error) {
    console.error("❌ Error during test:", error.message);
  }

  // Wait a bit for notifications to arrive
  setTimeout(() => {
    console.log("🏁 Test completed. Check the output above for results.");
    socket.disconnect();
    process.exit(0);
  }, 3000);
}

// Run the test
testNotificationSystem().catch(console.error);
