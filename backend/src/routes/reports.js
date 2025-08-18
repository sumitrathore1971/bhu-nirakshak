import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import Report from "../models/Report.js";
import User from "../models/User.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: function (req, file, cb) {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

// Get all reports (Admin/Enforcement only)
router.get(
  "/",
  authMiddleware,
  allowRoles(["Admin", "Enforcement"]),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        category,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const query = { isActive: true };
      if (status && status !== "All") query.status = status;
      if (category && category !== "All") query.category = category;

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

      const reports = await Report.find(query)
        .populate("reporter.userId", "name email")
        .populate("assignedTo", "name email")
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Report.countDocuments(query);

      res.json({
        success: true,
        data: {
          reports,
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          totalReports: total,
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// Get reports by user (Citizen can see their own reports)
router.get(
  "/my-reports",
  authMiddleware,
  allowRoles(["Citizen"]),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;

      const query = {
        "reporter.userId": req.user.id,
        isActive: true,
      };
      if (status && status !== "All") query.status = status;

      const reports = await Report.find(query)
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Report.countDocuments(query);

      res.json({
        success: true,
        data: {
          reports,
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          totalReports: total,
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Error fetching user reports:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// Get single report by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("reporter.userId", "name email")
      .populate("assignedTo", "name email")
      .populate("verifiedBy", "name email")
      .populate("actionTakenBy", "name email")
      .populate("closedBy", "name email")
      .populate("notes.addedBy", "name email");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Check if user has permission to view this report
    if (
      req.user.role === "Citizen" &&
      report.reporter.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ success: true, data: { report } });
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Create new report (Citizen only)
router.post("/", authMiddleware, allowRoles(["Citizen"]), upload.array('media', 5), async (req, res) => {
  try {
    // Parse report data from FormData
    let parsedData;
    try {
      parsedData = JSON.parse(req.body.reportData);
    } catch (error) {
      return res.status(400).json({ message: "Invalid report data format." });
    }

    const {
      fullName,
      phone,
      email,
      description,
      category,
      date,
      location,
      title,
    } = parsedData;

    // Validation
    if (
      !fullName ||
      !phone ||
      !description ||
      !category ||
      !date ||
      !location ||
      !title
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    // Parse and validate date
    const observationDate = new Date(date);
    if (isNaN(observationDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format." });
    }

    // Create report data
    const finalReportData = {
      reporter: {
        userId: req.user.id,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email ? email.trim().toLowerCase() : undefined,
      },
      title: title.trim(),
      description: description.trim(),
      category,
      dateOfObservation: observationDate,
      location: {
        coordinates: {
          type: "Point",
          coordinates: [parseFloat(location.lng), parseFloat(location.lat)],
        },
        address: location.address || "",
        area: location.area || "",
      },
      media: req.files ? req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
        uploadedAt: new Date()
      })) : [],
    };

    // Save with retry on duplicate key for reportId only (extremely rare with UUID)
    let report;
    let lastDupIdError = null;
    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        report = new Report(finalReportData);
        await report.save();
        lastDupIdError = null;
        break;
      } catch (err) {
        // Only retry when duplicate key is for reportId; otherwise bubble up
        if (err && err.code === 11000) {
          const isReportIdDup =
            err.keyPattern?.reportId ||
            String(err.message || "").includes("reportId");
          if (isReportIdDup) {
            lastDupIdError = err;
            const backoffMs = 10 * Math.pow(2, attempt); // 10,20,40,80,160
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
            continue;
          }
        }
        throw err;
      }
    }
    if (lastDupIdError) {
      return res.status(503).json({
        message: "Temporary ID generation conflict. Please try again.",
      });
    }

    // Populate reporter info for response
    await report.populate("reporter.userId", "name email");

    // Emit real-time notification to admin and enforcement rooms
    const populatedReport = await Report.findById(report._id)
      .populate("reporter.userId", "name email")
      .lean();

    console.log("📢 Emitting newReport notification to admin room");
    console.log("📢 Report data:", {
      reportId: populatedReport.reportId,
      title: populatedReport.title,
      reporter: populatedReport.reporter?.fullName,
      category: populatedReport.category,
    });

    // Emit to admin room
    req.io.to("admin-room").emit("newReport", {
      report: populatedReport,
      timestamp: new Date().toISOString(),
    });

    console.log("📢 Emitting newReport notification to enforcement room");

    // Emit to enforcement room
    req.io.to("enforcement-room").emit("newReport", {
      report: populatedReport,
      timestamp: new Date().toISOString(),
    });

    console.log("📢 Notifications emitted successfully");

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: { report },
    });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Update report status (Admin/Enforcement only)
router.put(
  "/:id/status",
  authMiddleware,
  allowRoles(["Admin", "Enforcement"]),
  async (req, res) => {
    try {
      const { status, notes } = req.body;
      const { id } = req.params;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const report = await Report.findById(id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      // Update status and add note if provided
      report.status = status;

      if (notes) {
        report.notes.push({
          content: notes,
          addedBy: req.user.id,
          isInternal: true,
          timestamp: new Date(),
        });
      }

      // Update specific fields based on status
      switch (status) {
        case "Verified":
          report.verifiedBy = req.user.id;
          report.verifiedAt = new Date();
          break;
        case "Action Taken":
          report.actionTakenBy = req.user.id;
          report.actionTakenAt = new Date();
          break;
        case "Closed":
          report.closedBy = req.user.id;
          report.closedAt = new Date();
          break;
      }

      await report.save();
      await report.populate("reporter.userId", "name email");
      await report.populate("assignedTo", "name email");

      // Emit status update to relevant rooms
      try {
        const userRoom = `user-${report.reporter.userId}`;
        req.io.to(userRoom).emit("reportStatusUpdated", {
          reportId: report._id,
          status: report.status,
          data: { report },
          timestamp: new Date().toISOString(),
        });
        // Also notify admin and enforcement rooms for dashboards, if needed
        req.io.to("admin-room").emit("reportStatusUpdated", {
          reportId: report._id,
          status: report.status,
          data: { report },
          timestamp: new Date().toISOString(),
        });
        req.io.to("enforcement-room").emit("reportStatusUpdated", {
          reportId: report._id,
          status: report.status,
          data: { report },
          timestamp: new Date().toISOString(),
        });
      } catch (emitErr) {
        console.warn("⚠️ Failed to emit reportStatusUpdated:", emitErr?.message || emitErr);
      }

      res.json({
        success: true,
        message: "Report status updated successfully",
        data: { report },
      });
    } catch (error) {
      console.error("Error updating report status:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// Add note to report
router.post("/:id/notes", authMiddleware, async (req, res) => {
  try {
    const { content, isInternal = false } = req.body;
    const { id } = req.params;

    if (!content) {
      return res.status(400).json({ message: "Note content is required" });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Check if user has permission to add notes
    if (
      req.user.role === "Citizen" &&
      report.reporter.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    report.notes.push({
      content: content.trim(),
      addedBy: req.user.id,
      isInternal,
      timestamp: new Date(),
    });

    await report.save();
    await report.populate("notes.addedBy", "name email");

    res.json({
      success: true,
      message: "Note added successfully",
      data: { report },
    });
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Assign report to enforcement officer (Admin only)
router.put(
  "/:id/assign",
  authMiddleware,
  allowRoles(["Admin"]),
  async (req, res) => {
    try {
      const { assignedTo } = req.body;
      const { id } = req.params;

      if (!assignedTo) {
        return res
          .status(400)
          .json({ message: "Enforcement officer ID is required" });
      }

      // Verify the assigned user is an enforcement officer
      const enforcementOfficer = await User.findById(assignedTo);
      if (!enforcementOfficer || enforcementOfficer.role !== "Enforcement") {
        return res.status(400).json({ message: "Invalid enforcement officer" });
      }

      const report = await Report.findById(id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      report.assignedTo = assignedTo;
      report.assignedAt = new Date();
      await report.save();
      await report.populate("assignedTo", "name email");

      res.json({
        success: true,
        message: "Report assigned successfully",
        data: { report },
      });
    } catch (error) {
      console.error("Error assigning report:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// Get report statistics (Admin/Enforcement only)
router.get(
  "/stats/overview",
  authMiddleware,
  allowRoles(["Admin", "Enforcement"]),
  async (req, res) => {
    try {
      const totalReports = await Report.countDocuments({ isActive: true });
      const pendingReports = await Report.countDocuments({
        status: "Pending",
        isActive: true,
      });
      const verifiedReports = await Report.countDocuments({
        status: "Verified",
        isActive: true,
      });
      const actionTakenReports = await Report.countDocuments({
        status: "Action Taken",
        isActive: true,
      });
      const closedReports = await Report.countDocuments({
        status: "Closed",
        isActive: true,
      });

      // Get reports by category
      const categoryStats = await Report.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentReports = await Report.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
        isActive: true,
      });

      res.json({
        success: true,
        data: {
          totalReports,
          pendingReports,
          verifiedReports,
          actionTakenReports,
          closedReports,
          categoryStats,
          recentReports,
        },
      });
    } catch (error) {
      console.error("Error fetching report statistics:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// Media upload route
router.post(
  "/:id/media",
  authMiddleware,
  allowRoles(["Citizen", "Admin", "Enforcement"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { mediaFiles } = req.body;

      if (!mediaFiles || !Array.isArray(mediaFiles)) {
        return res.status(400).json({
          success: false,
          message: "Media files are required",
        });
      }

      const report = await Report.findById(id);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        });
      }

      // Check if user has permission to modify this report
      if (req.user.role === "Citizen" && report.reporter.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You can only add media to your own reports",
        });
      }

      // Add new media files to the report
      const newMedia = mediaFiles.map(file => ({
        filename: file.filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        url: file.url,
        uploadedAt: new Date()
      }));

      report.media.push(...newMedia);
      await report.save();

      res.json({
        success: true,
        message: "Media files added successfully",
        data: { media: report.media },
      });
    } catch (error) {
      console.error("Error adding media to report:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// Delete report route
router.delete(
  "/:id",
  authMiddleware,
  allowRoles(["Citizen", "Admin", "Enforcement"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const report = await Report.findById(id);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        });
      }

      // Check if user has permission to delete this report (citizen can delete own report only)
      if (req.user.role === "Citizen") {
        const reporterUserId = report?.reporter?.userId;
        if (!reporterUserId) {
          return res.status(403).json({
            success: false,
            message: "Access denied. Report owner info unavailable.",
          });
        }
        if (reporterUserId.toString() !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: "You can only delete your own reports",
          });
        }

        // Optional business rule: Only allow citizen to delete rejected reports
        // If you want to allow deleting only when status is Rejected, keep this block; otherwise remove it
        if (report.status && report.status !== "Rejected") {
          return res.status(400).json({
            success: false,
            message: "Only rejected reports can be deleted by the citizen.",
          });
        }
      }

      // Soft delete by setting isActive to false
      report.isActive = false;
      report.deletedAt = new Date();
      report.deletedBy = req.user.id;
      await report.save();

      res.json({
        success: true,
        message: "Report deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting report:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
);

export default router;
