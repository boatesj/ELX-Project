const multer = require("multer");

const storage = multer.memoryStorage();

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
