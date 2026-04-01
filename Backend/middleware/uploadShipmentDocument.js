const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "uploads", "shipment-docs");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const safeOriginal = String(file.originalname || "document")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    const ext = path.extname(safeOriginal);
    const base = path.basename(safeOriginal, ext) || "document";
    const uniqueName = `${Date.now()}-${base}${ext}`;

    cb(null, uniqueName);
  },
});

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
]);

const fileFilter = (_req, file, cb) => {
  if (!file || !file.mimetype) {
    return cb(new Error("Invalid file upload."));
  }

  if (!allowedMimeTypes.has(file.mimetype)) {
    return cb(
      new Error(
        "Unsupported file type. Allowed: PDF, Word, Excel, images, plain text.",
      ),
    );
  }

  cb(null, true);
};

const uploadShipmentDocument = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

module.exports = uploadShipmentDocument;
