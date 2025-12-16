const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const mongoose = require("mongoose");

const BackupJob = require("../models/BackupJob");
const { createLog } = require("../utils/createLog");

const backupDir = process.env.BACKUP_DIR || "./backups";

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function listBackups(req, res) {
  const jobs = await BackupJob.find().sort({ createdAt: -1 }).limit(50);
  return res.json(jobs);
}

async function runBackup(req, res) {
  ensureDir(backupDir);

  const job = await BackupJob.create({ type: "Manual", status: "Running" });
  const fileName = `ellcworth-backup-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.zip`;
  const fullPath = path.join(backupDir, fileName);

  try {
    const output = fs.createWriteStream(fullPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    const done = new Promise((resolve, reject) => {
      output.on("close", resolve);
      archive.on("error", reject);
      archive.on("warning", reject);
    });

    archive.pipe(output);

    const collections = await mongoose.connection.db.collections();
    for (const c of collections) {
      const docs = await c.find({}).toArray();
      archive.append(JSON.stringify(docs, null, 2), {
        name: `${c.collectionName}.json`,
      });
    }

    await archive.finalize();
    await done;

    const stats = fs.statSync(fullPath);
    job.status = "Success";
    job.fileName = fileName;
    job.fileSizeBytes = stats.size;
    await job.save();

    await createLog(req, {
      type: "backup",
      action: "Ran manual backup",
      ref: fileName,
    });
    return res.json({ ok: true, job });
  } catch (e) {
    job.status = "Failed";
    job.error = e.message;
    await job.save();

    await createLog(req, {
      type: "backup",
      action: "Backup failed",
      ref: String(job._id),
      meta: { error: e.message },
    });

    return res.status(500).json({ message: e.message });
  }
}

async function downloadBackup(req, res) {
  const job = await BackupJob.findById(req.params.id);
  if (!job || !job.fileName)
    return res.status(404).json({ message: "Backup not found" });

  const fullPath = path.join(backupDir, job.fileName);
  if (!fs.existsSync(fullPath))
    return res.status(404).json({ message: "Backup file missing" });

  await createLog(req, {
    type: "backup",
    action: "Downloaded backup",
    ref: job.fileName,
  });
  return res.download(fullPath);
}

module.exports = { listBackups, runBackup, downloadBackup };
