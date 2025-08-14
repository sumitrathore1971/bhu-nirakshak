import express from "express";
import Drawing from "../models/Drawing.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all drawings for the authenticated user
router.get("/", async (req, res) => {
  try {
    const drawings = await Drawing.findAll({
      where: {
        userId: req.user.id,
        isActive: true,
      },
      order: [["exportDate", "DESC"]],
      attributes: [
        "id",
        "tagName",
        "exportDate",
        "featureCount",
        "featureTypes",
        "createdAt",
      ],
    });

    res.json({
      success: true,
      data: drawings,
    });
  } catch (error) {
    console.error("Error fetching drawings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch drawings",
      error: error.message,
    });
  }
});

// Get a specific drawing by ID
router.get("/:id", async (req, res) => {
  try {
    const drawing = await Drawing.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
        isActive: true,
      },
    });

    if (!drawing) {
      return res.status(404).json({
        success: false,
        message: "Drawing not found",
      });
    }

    res.json({
      success: true,
      data: drawing,
    });
  } catch (error) {
    console.error("Error fetching drawing:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch drawing",
      error: error.message,
    });
  }
});

// Save a new drawing
router.post("/", async (req, res) => {
  try {
    const { tagName, features, metadata } = req.body;

    if (!tagName || !features || !metadata) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: tagName, features, metadata",
      });
    }

    // Calculate feature counts
    const featureTypes = {
      polygons: features.filter((f) => f.geometry.type === "Polygon").length,
      lines: features.filter((f) => f.geometry.type === "LineString").length,
      points: features.filter((f) => f.geometry.type === "Point").length,
    };

    const drawing = await Drawing.create({
      tagName: tagName.trim(),
      exportDate: new Date(),
      featureCount: features.length,
      featureTypes,
      features,
      metadata: {
        ...metadata,
        tagName: tagName.trim(),
        exportDate: new Date().toISOString(),
        featureCount: features.length,
        featureTypes,
      },
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Drawing saved successfully",
      data: {
        id: drawing.id,
        tagName: drawing.tagName,
        exportDate: drawing.exportDate,
        featureCount: drawing.featureCount,
        featureTypes: drawing.featureTypes,
        createdAt: drawing.createdAt,
      },
    });
  } catch (error) {
    console.error("Error saving drawing:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save drawing",
      error: error.message,
    });
  }
});

// Update a drawing
router.put("/:id", async (req, res) => {
  try {
    const { tagName, features, metadata } = req.body;
    const drawingId = req.params.id;

    const drawing = await Drawing.findOne({
      where: {
        id: drawingId,
        userId: req.user.id,
        isActive: true,
      },
    });

    if (!drawing) {
      return res.status(404).json({
        success: false,
        message: "Drawing not found",
      });
    }

    // Update fields if provided
    if (tagName) drawing.tagName = tagName.trim();
    if (features) {
      drawing.features = features;
      drawing.featureCount = features.length;
      drawing.featureTypes = {
        polygons: features.filter((f) => f.geometry.type === "Polygon").length,
        lines: features.filter((f) => f.geometry.type === "LineString").length,
        points: features.filter((f) => f.geometry.type === "Point").length,
      };
    }
    if (metadata) drawing.metadata = metadata;

    await drawing.save();

    res.json({
      success: true,
      message: "Drawing updated successfully",
      data: {
        id: drawing.id,
        tagName: drawing.tagName,
        exportDate: drawing.exportDate,
        featureCount: drawing.featureCount,
        featureTypes: drawing.featureTypes,
        updatedAt: drawing.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating drawing:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update drawing",
      error: error.message,
    });
  }
});

// Delete a drawing (soft delete)
router.delete("/:id", async (req, res) => {
  try {
    const drawingId = req.params.id;

    const drawing = await Drawing.findOne({
      where: {
        id: drawingId,
        userId: req.user.id,
        isActive: true,
      },
    });

    if (!drawing) {
      return res.status(404).json({
        success: false,
        message: "Drawing not found",
      });
    }

    // Soft delete
    drawing.isActive = false;
    await drawing.save();

    res.json({
      success: true,
      message: "Drawing deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting drawing:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete drawing",
      error: error.message,
    });
  }
});

// Get drawing statistics
router.get("/stats/summary", async (req, res) => {
  try {
    const stats = await Drawing.findAll({
      where: {
        userId: req.user.id,
        isActive: true,
      },
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id")), "totalDrawings"],
        [sequelize.fn("SUM", sequelize.col("featureCount")), "totalFeatures"],
        [sequelize.fn("MAX", sequelize.col("exportDate")), "lastDrawingDate"],
      ],
    });

    const featureTypeStats = await Drawing.findAll({
      where: {
        userId: req.user.id,
        isActive: true,
      },
      attributes: [
        [
          sequelize.fn("SUM", sequelize.literal("featureTypes->>'polygons'")),
          "totalPolygons",
        ],
        [
          sequelize.fn("SUM", sequelize.literal("featureTypes->>'lines'")),
          "totalLines",
        ],
        [
          sequelize.fn("SUM", sequelize.literal("featureTypes->>'points'")),
          "totalPoints",
        ],
      ],
    });

    res.json({
      success: true,
      data: {
        summary: stats[0] || {},
        featureTypes: featureTypeStats[0] || {},
      },
    });
  } catch (error) {
    console.error("Error fetching drawing stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch drawing statistics",
      error: error.message,
    });
  }
});

export default router;
