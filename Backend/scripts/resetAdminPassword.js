// Backend/scripts/resetAdminPassword.js
const path = require("path");
const dotenv = require("dotenv");

// Always load Backend/.env regardless of CWD
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const User = require("../models/User");

async function main() {
  const emailArg = process.argv[2];
  const newPassArg = process.argv[3];

  if (!emailArg || !newPassArg) {
    console.error(
      'Usage:\n  node scripts/resetAdminPassword.js "admin@example.com" "NewStrongPass123!"',
    );
    process.exit(1);
  }

  const email = String(emailArg).toLowerCase().trim();
  const newPassword = String(newPassArg);

  const mongo =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.MONGO_URL ||
    process.env.DATABASE_URL ||
    process.env.DB_URL;

  if (!mongo) {
    console.error(
      "Missing Mongo connection string. Set MONGO_URI (or MONGODB_URI) in Backend/.env",
    );
    process.exit(1);
  }

  await mongoose.connect(mongo);

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    console.error(`No user found for email: ${email}`);
    process.exit(1);
  }

  // Set plain password once; pre-save hook hashes it once.
  user.password = newPassword;

  // Optional: ensure active
  if (!user.status) user.status = "active";

  await user.save();

  console.log(
    `✅ Password reset complete for ${email} (role=${user.role}, status=${user.status})`,
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
