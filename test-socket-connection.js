const io = require("socket.io-client");

// Test socket connection
const socket = io("http://localhost:8080");

socket.on("connect", () => {
  console.log("✅ Connected to Socket.io server");
  console.log("Socket ID:", socket.id);

  // Join admin room
  socket.emit("join-admin");
  console.log("👨‍💼 Joined admin room");

  // Simulate a new report after 2 seconds
  setTimeout(() => {
    console.log("📢 Simulating new report notification...");
    socket.emit("newReport", {
      report: {
        reportId: "TEST-001",
        title: "Test Report",
        reporter: {
          fullName: "Test User",
        },
        category: "Public Land",
        status: "Pending",
      },
      timestamp: new Date().toISOString(),
    });
  }, 2000);
});

socket.on("newReport", (data) => {
  console.log("📢 Received new report notification:", data);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from Socket.io server");
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket connection error:", error);
});

// Keep the script running for 10 seconds
setTimeout(() => {
  console.log("🔄 Test completed, disconnecting...");
  socket.disconnect();
  process.exit(0);
}, 10000);
