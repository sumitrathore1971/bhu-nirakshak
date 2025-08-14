import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Drawing = sequelize.define(
  "Drawing",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tagName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Custom tag name for the drawing",
    },
    exportDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    featureCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    featureTypes: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        polygons: 0,
        lines: 0,
        points: 0,
      },
    },
    features: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: "GeoJSON features array",
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: "Complete metadata including tagName, exportDate, etc.",
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment:
        "ID of the admin user who created the drawing (MongoDB ObjectId as string)",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Whether the drawing is active/visible",
    },
  },
  {
    tableName: "drawings",
    timestamps: true,
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["tag_name"],
      },
      {
        fields: ["export_date"],
      },
    ],
  }
);

export default Drawing;
