import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import ConstructionPlan from "../models/ConstructionPlan.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Multer storage for documents and inspection photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads/"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024, files: 10 },
});

// GET /api/construction → Global list (Admin/Departments)
router.get(
  "/",
  authMiddleware,
  allowRoles(["Admin", "Revenue", "UrbanDevelopment", "Enforcement"]),
  async (req, res) => {
    try {
      const { finalStatus, page = 1, limit = 20 } = req.query;
      const query = {};
      if (finalStatus && ["Pending", "Suspicious", "Approved", "Rejected"].includes(finalStatus)) {
        query.finalStatus = finalStatus;
      }
      const plans = await ConstructionPlan.find(query)
        .populate("applicant", "name email role")
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .lean();
      const total = await ConstructionPlan.countDocuments(query);
      res.json({ success: true, data: { plans, total, page: Number(page), limit: Number(limit) } });
    } catch (err) {
      console.error("Error fetching construction plans:", err);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  }
);

// POST /api/construction/apply → Citizen submits application
router.post(
  "/apply",
  authMiddleware,
  allowRoles(["Citizen"]),
  upload.fields([
    { name: "sitePlan", maxCount: 1 },
    { name: "ownershipDocs", maxCount: 1 },
    { name: "architectPlan", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const applicantId = req.user.id;
      const { plotCoordinates } = req.body;

      if (!plotCoordinates) {
        return res.status(400).json({ message: "plotCoordinates is required" });
      }

      let polygon;
      try {
        polygon = typeof plotCoordinates === "string" ? JSON.parse(plotCoordinates) : plotCoordinates;
      } catch (e) {
        return res.status(400).json({ message: "Invalid plotCoordinates JSON" });
      }
      if (!polygon || polygon.type !== "Polygon" || !Array.isArray(polygon.coordinates)) {
        return res.status(400).json({ message: "plotCoordinates must be GeoJSON Polygon" });
      }

      const docs = {
        sitePlan: req.files?.sitePlan?.[0]?.filename ? `/uploads/${req.files.sitePlan[0].filename}` : undefined,
        ownershipDocs: req.files?.ownershipDocs?.[0]?.filename
          ? `/uploads/${req.files.ownershipDocs[0].filename}`
          : undefined,
        architectPlan: req.files?.architectPlan?.[0]?.filename
          ? `/uploads/${req.files.architectPlan[0].filename}`
          : undefined,
      };

      const plan = new ConstructionPlan({
        applicant: applicantId,
        documents: docs,
        plotCoordinates: { type: "Polygon", coordinates: polygon.coordinates },
      });
      await plan.save();

      res.status(201).json({ success: true, data: { plan } });
    } catch (err) {
      console.error("Error submitting construction plan:", err);
      res.status(500).json({ message: "Failed to submit application" });
    }
  }
);

// GET /api/construction/my → Citizen fetches their applications
router.get("/my", authMiddleware, allowRoles(["Citizen"]), async (req, res) => {
  try {
    const plans = await ConstructionPlan.find({ applicant: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: { plans } });
  } catch (err) {
    console.error("Error fetching my applications:", err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

// GET /api/construction/:id → Fetch details of a specific application
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const plan = await ConstructionPlan.findById(req.params.id)
      .populate("applicant", "name email role")
      .populate("revenueVerification.verifiedBy", "name email role")
      .populate("urbanVerification.checkedBy", "name email role")
      .populate("siteInspection.officer", "name email role")
      .lean();

    if (!plan) return res.status(404).json({ message: "Application not found" });

    if (req.user.role === "Citizen" && String(plan.applicant?._id) !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ success: true, data: { plan } });
  } catch (err) {
    console.error("Error fetching application:", err);
    res.status(500).json({ message: "Failed to fetch application" });
  }
});

// PUT /api/construction/:id/revenue-verify
router.put(
  "/:id/revenue-verify",
  authMiddleware,
  allowRoles(["Revenue"]),
  async (req, res) => {
    try {
      const { status, note } = req.body;
      if (!status || !["Pending", "Verified", "Rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const plan = await ConstructionPlan.findById(req.params.id);
      if (!plan) return res.status(404).json({ message: "Application not found" });

      plan.revenueVerification = {
        status,
        note: note || undefined,
        verifiedBy: req.user.id,
        date: new Date(),
      };

      // If verified and urban already approved, auto set final Approved
      if (status === "Verified" && plan.urbanVerification?.status === "Approved") {
        plan.finalStatus = "Approved";
      }
      await plan.save();
      try {
        const room = `user-${String(plan.applicant)}`;
        req.io.to(room).emit("constructionPlanUpdated", {
          planId: String(plan._id),
          applicationId: plan.applicationId,
          finalStatus: plan.finalStatus,
          revenueVerification: plan.revenueVerification,
          urbanVerification: plan.urbanVerification,
          siteInspection: plan.siteInspection,
          updatedAt: plan.updatedAt,
        });
      } catch (_) {}
      res.json({ success: true, data: { plan } });
    } catch (err) {
      console.error("Error in revenue verification:", err);
      res.status(500).json({ message: "Failed to update revenue verification" });
    }
  }
);

// PUT /api/construction/:id/urban-verify
router.put(
  "/:id/urban-verify",
  authMiddleware,
  allowRoles(["UrbanDevelopment"]),
  async (req, res) => {
    try {
      const { status, note } = req.body;
      if (!status || !["Pending", "Approved", "Rejected", "Suspicious"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const plan = await ConstructionPlan.findById(req.params.id);
      if (!plan) return res.status(404).json({ message: "Application not found" });

      plan.urbanVerification = {
        status,
        note: note || undefined,
        checkedBy: req.user.id,
        date: new Date(),
      };

      if (status === "Approved" && plan.revenueVerification?.status === "Verified") {
        plan.finalStatus = "Approved";
      }
      await plan.save();
      try {
        const room = `user-${String(plan.applicant)}`;
        req.io.to(room).emit("constructionPlanUpdated", {
          planId: String(plan._id),
          applicationId: plan.applicationId,
          finalStatus: plan.finalStatus,
          revenueVerification: plan.revenueVerification,
          urbanVerification: plan.urbanVerification,
          siteInspection: plan.siteInspection,
          updatedAt: plan.updatedAt,
        });
      } catch (_) {}
      res.json({ success: true, data: { plan } });
    } catch (err) {
      console.error("Error in urban verification:", err);
      res.status(500).json({ message: "Failed to update urban verification" });
    }
  }
);

// PUT /api/construction/:id/forward-revenue → Urban forwards to Revenue
router.put(
  "/:id/forward-revenue",
  authMiddleware,
  allowRoles(["UrbanDevelopment", "Admin"]),
  async (req, res) => {
    try {
      const { note } = req.body || {};
      const plan = await ConstructionPlan.findById(req.params.id);
      if (!plan) return res.status(404).json({ message: "Application not found" });

      plan.revenueVerification = {
        status: "Pending",
        note: note || "Forwarded by Urban Department",
        verifiedBy: undefined,
        date: new Date(),
      };

      await plan.save();

      try {
        const room = `user-${String(plan.applicant)}`;
        req.io.to(room).emit("constructionPlanUpdated", {
          planId: String(plan._id),
          applicationId: plan.applicationId,
          finalStatus: plan.finalStatus,
          revenueVerification: plan.revenueVerification,
          urbanVerification: plan.urbanVerification,
          siteInspection: plan.siteInspection,
          updatedAt: plan.updatedAt,
        });
      } catch (_) {}

      res.json({ success: true, data: { plan } });
    } catch (err) {
      console.error("Error forwarding to revenue:", err);
      res.status(500).json({ message: "Failed to forward to revenue" });
    }
  }
);

// PUT /api/construction/:id/flag → Urban marks suspicious → auto-create site inspection
router.put(
  "/:id/flag",
  authMiddleware,
  allowRoles(["UrbanDevelopment"]),
  async (req, res) => {
    try {
      const { note } = req.body || {};
      const plan = await ConstructionPlan.findById(req.params.id);
      if (!plan) return res.status(404).json({ message: "Application not found" });

      plan.urbanVerification = {
        status: "Suspicious",
        note: note || undefined,
        checkedBy: req.user.id,
        date: new Date(),
      };
      plan.siteInspection = plan.siteInspection || {};
      plan.siteInspection.required = true;
      plan.siteInspection.status = "Scheduled";
      plan.finalStatus = "Suspicious";

      await plan.save();
      try {
        const room = `user-${String(plan.applicant)}`;
        req.io.to(room).emit("constructionPlanUpdated", {
          planId: String(plan._id),
          applicationId: plan.applicationId,
          finalStatus: plan.finalStatus,
          revenueVerification: plan.revenueVerification,
          urbanVerification: plan.urbanVerification,
          siteInspection: plan.siteInspection,
          updatedAt: plan.updatedAt,
        });
      } catch (_) {}
      res.json({ success: true, data: { plan } });
    } catch (err) {
      console.error("Error flagging application:", err);
      res.status(500).json({ message: "Failed to flag application" });
    }
  }
);

// PUT /api/construction/:id/site-inspect → Enforcement updates inspection report
const inspectionUpload = upload.fields([{ name: "photos", maxCount: 8 }]);
router.put(
  "/:id/site-inspect",
  authMiddleware,
  allowRoles(["Enforcement", "Admin"]),
  inspectionUpload,
  async (req, res) => {
    try {
      const { report, status, officer, scheduledAt, completedAt } = req.body || {};

      const plan = await ConstructionPlan.findById(req.params.id);
      if (!plan) return res.status(404).json({ message: "Application not found" });

      // officer fallback to current user if Enforcement
      let officerId = officer;
      if (!officerId && req.user.role === "Enforcement") officerId = req.user.id;

      const photos = (req.files?.photos || []).map((f) => ({
        filename: f.filename,
        originalName: f.originalname,
        mimeType: f.mimetype,
        size: f.size,
        url: `/uploads/${f.filename}`,
        uploadedAt: new Date(),
      }));

      plan.siteInspection = {
        ...(plan.siteInspection || {}),
        required: true,
        officer: officerId || plan.siteInspection?.officer || undefined,
        report: report ?? plan.siteInspection?.report,
        photos: [...(plan.siteInspection?.photos || []), ...photos],
        status: status && ["Pending", "Scheduled", "Completed"].includes(status)
          ? status
          : plan.siteInspection?.status || "Scheduled",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : plan.siteInspection?.scheduledAt,
        completedAt: completedAt ? new Date(completedAt) : plan.siteInspection?.completedAt,
      };

      await plan.save();
      try {
        const room = `user-${String(plan.applicant)}`;
        req.io.to(room).emit("constructionPlanUpdated", {
          planId: String(plan._id),
          applicationId: plan.applicationId,
          finalStatus: plan.finalStatus,
          revenueVerification: plan.revenueVerification,
          urbanVerification: plan.urbanVerification,
          siteInspection: plan.siteInspection,
          updatedAt: plan.updatedAt,
        });
      } catch (_) {}
      res.json({ success: true, data: { plan } });
    } catch (err) {
      console.error("Error updating site inspection:", err);
      res.status(500).json({ message: "Failed to update site inspection" });
    }
  }
);

// PUT /api/construction/:id/finalize → Admin finalizes
router.put(
  "/:id/finalize",
  authMiddleware,
  allowRoles(["Admin"]),
  async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid final status" });
      }
      const plan = await ConstructionPlan.findById(req.params.id);
      if (!plan) return res.status(404).json({ message: "Application not found" });

      plan.finalStatus = status;
      await plan.save();
      try {
        const room = `user-${String(plan.applicant)}`;
        req.io.to(room).emit("constructionPlanUpdated", {
          planId: String(plan._id),
          applicationId: plan.applicationId,
          finalStatus: plan.finalStatus,
          revenueVerification: plan.revenueVerification,
          urbanVerification: plan.urbanVerification,
          siteInspection: plan.siteInspection,
          updatedAt: plan.updatedAt,
        });
      } catch (_) {}
      res.json({ success: true, data: { plan } });
    } catch (err) {
      console.error("Error finalizing application:", err);
      res.status(500).json({ message: "Failed to finalize application" });
    }
  }
);

export default router;


