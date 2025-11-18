import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const reportSchema = new mongoose.Schema(
  {
    // Report identification
    reportId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },

    // Reporter information
    reporter: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      fullName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
        match: /^[0-9]{10}$/,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      },
    },

    // Encroachment details
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      enum: ["Public Land", "Private Land", "Road", "Riverbank", "Other"],
      default: "Other",
    },
    dateOfObservation: {
      type: Date,
      required: true,
    },

    // Location information
    location: {
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          required: true,
          validate: {
            validator: function (v) {
              return (
                v.length === 2 &&
                v[0] >= -180 &&
                v[0] <= 180 &&
                v[1] >= -90 &&
                v[1] <= 90
              );
            },
            message:
              "Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90.",
          },
        },
      },
      address: {
        type: String,
        trim: true,
        maxlength: 500,
      },
      area: {
        type: String,
        trim: true,
        maxlength: 100,
      },
    },

    // Media attachments
    media: [
      {
        filename: {
          type: String,
          required: true,
        },
        originalName: {
          type: String,
          required: true,
        },
        mimeType: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Report status and workflow
    status: {
      type: String,
      enum: [
        "Pending",
        "Verified",
        "Assigned to Enforcement",
        "Action Taken",
        "Closed",
        "Rejected",
      ],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    stage: {
      type: Number,
      min: 0,
      max: 4,
      default: 0, // 0: Reported, 1: Verified, 2: Action Taken, 3: Closed
    },

    // Administrative fields
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedAt: {
      type: Date,
    },
    estimatedResolutionTime: {
      type: Number, // in days
      default: 7,
    },
    notes: [
      {
        content: {
          type: String,
          required: true,
          trim: true,
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        isInternal: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Verification and action tracking
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    actionTakenAt: Date,
    actionTakenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    closedAt: Date,
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Metadata
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
reportSchema.index({ "location.coordinates": "2dsphere" });
reportSchema.index({ reporter: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ category: 1 });
reportSchema.index({ createdAt: -1 });

// Virtual for formatted address
reportSchema.virtual("formattedAddress").get(function () {
  if (this.location.address) {
    return this.location.address;
  }
  return `${this.location.coordinates.coordinates[1]}, ${this.location.coordinates.coordinates[0]}`;
});

// Virtual for status stage mapping
reportSchema.virtual("statusStage").get(function () {
  const stageMap = {
    Pending: 0,
    Verified: 1,
    "Assigned to Enforcement": 1,
    "Action Taken": 2,
    Closed: 3,
    Rejected: -1,
  };
  return stageMap[this.status] || 0;
});

// Pre-save middleware to update stage based on status
reportSchema.pre("save", function (next) {
  const stageMap = {
    Pending: 0,
    Verified: 1,
    "Assigned to Enforcement": 1,
    "Action Taken": 2,
    Closed: 3,
    Rejected: -1,
  };

  if (this.isModified("status")) {
    this.stage = stageMap[this.status] || 0;
  }

  next();
});

// Removed counter-based ID generator in favor of UUIDs

// Instance method to add note
reportSchema.methods.addNote = function (content, addedBy, isInternal = false) {
  this.notes.push({
    content,
    addedBy,
    isInternal,
  });
  return this.save();
};

// Instance method to update status
reportSchema.methods.updateStatus = function (newStatus, updatedBy) {
  this.status = newStatus;

  // Update timestamps based on status
  switch (newStatus) {
    case "Verified":
      this.verifiedAt = new Date();
      this.verifiedBy = updatedBy;
      break;
    case "Action Taken":
      this.actionTakenAt = new Date();
      this.actionTakenBy = updatedBy;
      break;
    case "Closed":
      this.closedAt = new Date();
      this.closedBy = updatedBy;
      break;
  }

  return this.save();
};

const Report = mongoose.model("Report", reportSchema);
export default Report;
