import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

// ReportedParcel model mapped to PostGIS table `reported_parcels`
// Fields:
// - id (serial primary key)
// - source (varchar) default 'Citizen Report'
// - detected_on (timestamp) default now()
// - geom (geometry(Polygon, 4326))

const ReportedParcel = sequelize.define(
  "ReportedParcel",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    report_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Associated MongoDB reportId for linking parcel to a report",
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Citizen Report",
    },
    detected_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    geom: {
      type: DataTypes.GEOMETRY("POLYGON", 4326),
      allowNull: false,
    },
  },
  {
    tableName: "reported_parcels",
    timestamps: false,
    indexes: [{ fields: ["source"] }, { fields: ["report_id"] }],
  }
);

export default ReportedParcel;
