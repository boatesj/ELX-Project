// Backend/models/Shipment.js
const mongoose = require("mongoose");
const Counter = require("./Counter");

// ------------------ SUBSCHEMAS ------------------

// Tracking history (status progression)
const TrackingEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      trim: true,
      default: "update",
    },
    event: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    meta: {
      type: Object,
      default: {},
    },
  },
  { _id: false }
);

// Uploaded documents (BOL, ID, Invoice, etc.)
const DocumentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true, trim: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

// Charge lines (optional – for invoices / cost breakdown)
const ChargeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true }, // e.g. "Ocean Freight"
    amount: { type: Number, required: true },
    currency: { type: String, default: "GBP", trim: true },
    category: {
      type: String,
      trim: true, // e.g. "freight", "local_charges", "docs"
    },
  },
  { _id: false }
);

// Package-level details (for pallets, boxes, parcels, etc.)
const PackageSchema = new mongoose.Schema(
  {
    type: { type: String, trim: true }, // e.g. "pallet", "box", "carton"
    lengthCm: { type: Number },
    widthCm: { type: Number },
    heightCm: { type: Number },
    weightKg: { type: Number },
    quantity: { type: Number, default: 1 },
    description: { type: String, trim: true },
  },
  { _id: false }
);

// ------------------ MAIN SCHEMA ------------------

const ShipmentSchema = new mongoose.Schema(
  {
    // Owner / creator (registered user)
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Who keyed in the booking (often an Ellcworth admin)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Unique business reference number
    referenceNo: {
      type: String,
      required: true,
      trim: true,
    },

    // Basic classification
    shipmentType: {
      type: String,
      enum: ["export", "import", "cross_trade"],
      default: "export",
    },

    serviceLevel: {
      type: String,
      enum: ["door_to_port", "port_to_port", "door_to_door", "port_to_door"],
      default: "port_to_port",
    },

    // Shipper / Exporter
    shipper: {
      name: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, required: true, trim: true },
    },

    // Consignee / Receiver
    consignee: {
      name: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
    },

    // Notify party (optional)
    notify: {
      name: { type: String, trim: true },
      address: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
    },

    // Extra origin/destination detail for door moves
    originAddress: {
      type: String,
      trim: true,
    },
    destinationAddress: {
      type: String,
      trim: true,
    },

    // Commercial / terms
    incoterm: {
      type: String,
      trim: true, // e.g. "FOB", "CIF", "DAP"
    },
    cargoValue: {
      amount: { type: Number },
      currency: { type: String, default: "GBP", trim: true },
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "part_paid", "paid", "on_account"],
      default: "unpaid",
    },

    // Transport mode – extended for future, keep existing values to avoid breaking old data
    mode: {
      type: String,
      enum: [
        "RoRo",
        "Container",
        "Air",
        "LCL",
        "Documents",
        "Pallets",
        "Parcels",
      ],
      default: "RoRo",
      index: true,
    },

    // Cargo / Goods information
    cargo: {
      description: { type: String, trim: true },
      hsCode: { type: String, trim: true },
      weight: { type: String, trim: true }, // keep string to accept "1300 kg" style for now
      volumeCbm: { type: Number },
      packageCount: { type: Number },

      // Vehicles (RoRo)
      vehicle: {
        make: { type: String, trim: true },
        model: { type: String, trim: true },
        year: { type: String, trim: true },
        vin: { type: String, trim: true },
        registrationNo: { type: String, trim: true },
      },

      // Containers (FCL / LCL)
      container: {
        containerNo: { type: String, trim: true },
        size: { type: String, trim: true }, // e.g. "20GP", "40HC"
        sealNo: { type: String, trim: true },
      },

      // Pallets / boxes / parcels
      packages: [PackageSchema],

      // Secure documents (certificates, transcripts, cheques, etc.)
      documentsShipment: {
        count: { type: Number },
        docTypes: { type: [String], default: [] }, // e.g. ["certificates", "cheques"]
        secure: { type: Boolean, default: false },
      },
    },

    // Origin and Destination ports
    ports: {
      originPort: { type: String, required: true, trim: true },
      destinationPort: { type: String, required: true, trim: true },
    },

    // Vessel / flight info (optional)
    vessel: {
      name: { type: String, trim: true },
      voyage: { type: String, trim: true },
      // For air we can still reuse these two fields or add more later
    },

    // Shipping & arrival estimates
    shippingDate: { type: Date },
    eta: { type: Date },

    // Shipment lifecycle status (internal tracking)
    status: {
      type: String,
      enum: [
        "pending",
        "booked",
        "at_origin_yard",
        "loaded",
        "sailed",
        "arrived",
        "cleared",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    // BackgroundService notifications
    notifications: {
      pending: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
    },

    // Tracking history
    trackingEvents: [TrackingEventSchema],

    // Uploaded docs (BOL, IDs, invoices, etc.)
    documents: [DocumentSchema],

    // Financial lines (optional, for later invoices)
    charges: [ChargeSchema],

    // Notes
    customerNotes: { type: String, trim: true },
    internalNotes: { type: String, trim: true },

    // Booking channel
    channel: {
      type: String,
      enum: ["web_portal", "admin_panel", "api"],
      default: "admin_panel",
    },

    // Logical deletion (for soft deletes)
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ------------------ INDEXES ------------------
ShipmentSchema.index({ referenceNo: 1 }, { unique: true });
ShipmentSchema.index({ "cargo.vehicle.vin": 1 }, { sparse: true });
ShipmentSchema.index({ "cargo.container.containerNo": 1 }, { sparse: true });
ShipmentSchema.index({ customer: 1, createdAt: -1 });
ShipmentSchema.index({
  status: 1,
  mode: 1,
  "ports.originPort": 1,
  "ports.destinationPort": 1,
});

// ------------------ PRE-VALIDATE LOGIC ------------------
// Generate a unique business reference number before validation if not provided
ShipmentSchema.pre("validate", async function (next) {
  try {
    // Only generate on NEW docs with no referenceNo explicitly set
    if (this.isNew && !this.referenceNo) {
      const modeCodeMap = {
        RoRo: "RORO",
        Container: "FCL",
        Air: "AIR",
        LCL: "LCL",
        Documents: "DOC",
        Parcels: "PAR",
        Pallets: "PAL",
      };

      const modeCode = modeCodeMap[this.mode] || "GEN";

      const now = new Date();
      const YY = String(now.getFullYear()).slice(-2);
      const MM = String(now.getMonth() + 1).padStart(2, "0");
      const DD = String(now.getDate()).padStart(2, "0");

      // Counter key: per mode per day
      const key = `${modeCode}-${YY}${MM}${DD}`;

      const counter = await Counter.findOneAndUpdate(
        { key },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const seq = String(counter.seq).padStart(4, "0");

      this.referenceNo = `ELX-${modeCode}-${YY}${MM}${DD}-${seq}`;
    }

    next();
  } catch (err) {
    console.error("Error generating referenceNo (pre-validate):", err);
    next(err);
  }
});

module.exports = mongoose.model("Shipment", ShipmentSchema);
