import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.connectionCount = 0;
    this.roomsJoined = new Set(); // Track which rooms have been joined
  }

  connect() {
    if (this.socket && this.isConnected) {
      console.log("🔌 Socket already connected, incrementing connection count");
      this.connectionCount++;
      return;
    }

    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
    console.log("🔌 Attempting to connect to Socket.io server at:", backendUrl);

    this.socket = io(backendUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("🔌 Connected to Socket.io server");
      this.isConnected = true;

      // Re-join rooms that were previously joined
      this.roomsJoined.forEach((room) => {
        if (room.startsWith("join-user:")) {
          const userId = room.split(":")[1];
          console.log(`🔌 Re-joining user room for user: ${userId}`);
          this.socket.emit("join-user", userId);
        } else {
          console.log(`🔌 Re-joining room: ${room}`);
          this.socket.emit(room);
        }
      });
    });

    this.socket.on("disconnect", () => {
      console.log("🔌 Disconnected from Socket.io server");
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔌 Socket connection error:", error);
      this.isConnected = false;
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(
        `🔌 Reconnected to Socket.io server after ${attemptNumber} attempts`
      );
      this.isConnected = true;

      // Re-join rooms after reconnection
      this.roomsJoined.forEach((room) => {
        if (room.startsWith("join-user:")) {
          const userId = room.split(":")[1];
          console.log(`🔌 Re-joining user room after reconnect: ${userId}`);
          this.socket.emit("join-user", userId);
        } else {
          console.log(`🔌 Re-joining room after reconnect: ${room}`);
          this.socket.emit(room);
        }
      });
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("🔌 Socket reconnection error:", error);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("🔌 Socket reconnection failed");
    });

    this.connectionCount++;
  }

  disconnect() {
    this.connectionCount--;

    if (this.connectionCount <= 0) {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        this.isConnected = false;
        this.listeners.clear();
        this.roomsJoined.clear();
        this.connectionCount = 0;
        console.log("🔌 Disconnected from Socket.io server");
      }
    } else {
      console.log(
        `🔌 ${this.connectionCount} components still using socket, keeping connection alive`
      );
    }
  }

  joinAdminRoom() {
    if (this.socket && this.isConnected) {
      if (!this.roomsJoined.has("join-admin")) {
        this.socket.emit("join-admin");
        this.roomsJoined.add("join-admin");
        console.log("👨‍💼 Joined admin notification room");
      } else {
        console.log("👨‍💼 Already joined admin notification room");
      }
    } else {
      console.warn("Socket not connected, cannot join admin room");
      // Queue the room join for when connection is established
      if (this.socket) {
        this.socket.once("connect", () => {
          console.log("🔌 Connection established, now joining admin room");
          this.joinAdminRoom();
        });
      }
    }
  }

  joinEnforcementRoom() {
    if (this.socket && this.isConnected) {
      if (!this.roomsJoined.has("join-enforcement")) {
        this.socket.emit("join-enforcement");
        this.roomsJoined.add("join-enforcement");
        console.log("👮‍♂️ Joined enforcement notification room");
      } else {
        console.log("👮‍♂️ Already joined enforcement notification room");
      }
    } else {
      console.warn("Socket not connected, cannot join enforcement room");
      // Queue the room join for when connection is established
      if (this.socket) {
        this.socket.once("connect", () => {
          console.log(
            "🔌 Connection established, now joining enforcement room"
          );
          this.joinEnforcementRoom();
        });
      }
    }
  }

  joinUserRoom(userId) {
    if (!userId) {
      console.warn("Cannot join user room without userId");
      return;
    }
    if (this.socket && this.isConnected) {
      const key = `join-user:${userId}`;
      if (!this.roomsJoined.has(key)) {
        this.socket.emit("join-user", userId);
        this.roomsJoined.add(key);
        console.log(`🧑‍💻 Joined user room for user: ${userId}`);
      } else {
        console.log(`🧑‍💻 Already joined user room for user: ${userId}`);
      }
    } else {
      console.warn("Socket not connected, cannot join user room now");
      if (this.socket) {
        this.socket.once("connect", () => this.joinUserRoom(userId));
      }
    }
  }

  onReportStatusUpdated(callback) {
    if (!this.socket) return;
    const eventName = "reportStatusUpdated";
    this.socket.off(eventName, callback);
    this.socket.on(eventName, (payload) => callback(payload));
    if (!this.listeners.has(eventName)) this.listeners.set(eventName, []);
    const arr = this.listeners.get(eventName);
    if (!arr.includes(callback)) arr.push(callback);
  }

  offReportStatusUpdated(callback) {
    if (!this.socket) return;
    const eventName = "reportStatusUpdated";
    this.socket.off(eventName, callback);
    if (this.listeners.has(eventName)) {
      const arr = this.listeners.get(eventName);
      const idx = arr.indexOf(callback);
      if (idx > -1) arr.splice(idx, 1);
    }
  }

  onNewReport(callback) {
    if (!this.socket) {
      console.warn("Socket not initialized, cannot listen for new reports");
      return;
    }

    const eventName = "newReport";

    // Remove any existing listeners for this callback to prevent duplicates
    this.socket.off(eventName, callback);

    // Add the new listener
    this.socket.on(eventName, (data) => {
      console.log("📢 Received new report notification:", data);
      callback(data);
    });

    // Store the listener for cleanup
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }

    // Check if callback already exists to prevent duplicates
    const existingCallbacks = this.listeners.get(eventName);
    if (!existingCallbacks.includes(callback)) {
      existingCallbacks.push(callback);
    }
  }

  offNewReport(callback) {
    if (!this.socket) return;

    const eventName = "newReport";
    this.socket.off(eventName, callback);

    // Remove from listeners map
    if (this.listeners.has(eventName)) {
      const listeners = this.listeners.get(eventName);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Clean up all listeners for a specific component
  cleanup() {
    if (this.socket) {
      this.listeners.forEach((callbacks, eventName) => {
        callbacks.forEach((callback) => {
          this.socket.off(eventName, callback);
        });
      });
      this.listeners.clear();
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
      connectionCount: this.connectionCount,
      roomsJoined: Array.from(this.roomsJoined),
    };
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;
