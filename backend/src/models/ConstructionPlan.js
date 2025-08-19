import mongoose from "mongoose";
import Counter from "./Counter.js";

const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const verificationStatus = {
  REVENUE: ["Pending", "Verified", "Rejected"],
  URBAN: ["Pending", "Approved", "Rejected", "Suspicious"],
};

const siteInspectionStatus = ["Pending", "Scheduled", "Completed"];

const constructionPlanSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    documents: {
      sitePlan: { type: String },
      ownershipDocs: { type: String },
      architectPlan: { type: String },
    },
    plotCoordinates: {
      type: {
        type: String,
        enum: ["Polygon"],
        default: "Polygon",
      },
      coordinates: {
        type: [[[Number]]],
        required: true,
        validate: {
          validator: function (coords) {
            return (
              Array.isArray(coords) &&
              coords.length > 0 &&
              Array.isArray(coords[0]) &&
              coords[0].length >= 4 &&
              Array.isArray(coords[0][0])
            );
          },
          message: "plotCoordinates must be a valid GeoJSON Polygon",
        },
      },
    },
    revenueVerification: {
      status: {
        type: String,
        enum: verificationStatus.REVENUE,
        default: "Pending",
      },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      note: { type: String, trim: true },
      date: { type: Date },
    },
    urbanVerification: {
      status: {
        type: String,
        enum: verificationStatus.URBAN,
        default: "Pending",
      },
      checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      note: { type: String, trim: true },
      date: { type: Date },
    },
    siteInspection: {
      required: { type: Boolean, default: false },
      officer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      report: { type: String, trim: true },
      photos: { type: [mediaSchema], default: [] },
      status: { type: String, enum: siteInspectionStatus, default: "Pending" },
      scheduledAt: { type: Date },
      completedAt: { type: Date },
    },
    finalStatus: {
      type: String,
      enum: ["Pending", "Suspicious", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },
  },
  { timestamps: true }
);

// 2dsphere index for geospatial queries
constructionPlanSchema.index({ plotCoordinates: "2dsphere" });

// Generate Application ID in the format APP-YYYY-xxxxx using counter per-year
async function generateApplicationId() {
  const year = new Date().getFullYear();
  const key = `APP:${year}`;
  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const seq = counter.seq.toString().padStart(5, "0");
  return `APP-${year}-${seq}`;
}

constructionPlanSchema.pre("validate", async function (next) {
  try {
    if (!this.applicationId) {
      this.applicationId = await generateApplicationId();
    }
    return next();
  } catch (err) {
    return next(err);
  }
});

const ConstructionPlan = mongoose.model("ConstructionPlan", constructionPlanSchema);
export default ConstructionPlan;


