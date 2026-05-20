const mongoose = require("mongoose");
const User = require("../models/User");
const Shipment = require("../models/Shipment");

const isValidId = (id) => mongoose.isValidObjectId(id);

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

/**
 * CREATE USER (Admin creates a CRM record)
 */
const createUser = async (req, res) => {
  try {
    const {
      accountType,
      fullname,
      email,
      phone,
      country,
      city,
      postcode,
      address,
      role,
      notes,
      status,
    } = req.body;

    const safeFullname = typeof fullname === "string" ? fullname.trim() : "";
    const safePhone = typeof phone === "string" ? phone.trim() : "";
    const safeEmail = normalizeEmail(email);

    // Backend safety net (admin form should still validate on frontend)
    if (!safeFullname || !safeEmail || !safePhone) {
      return res.status(400).json({
        ok: false,
        message: "fullname, email and phone are required.",
      });
    }

    const existing = await User.findOne({ email: safeEmail });
    if (existing) {
      return res.status(409).json({
        ok: false,
        message: "A user with this email already exists.",
      });
    }

    const newUser = await User.create({
      accountType: accountType || "Business",
      fullname: safeFullname,
      email: safeEmail,
      phone: safePhone,
      country,
      city,
      postcode,
      address,
      role: role || "Shipper",
      notes,
      status: status || "pending",
    });

    return res.status(201).json({
      ok: true,
      message: "User created successfully.",
      data: newUser,
      user: newUser, // backward-friendly
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

/**
 * GET ALL USERS (admin)
 */
const getAllUsers = async (req, res) => {
  try {
    // default: exclude password (it’s select:false anyway)
    // By default exclude archived users; pass ?archived=true to see them
    const showArchived = req.query.archived === "true";
    const filter = showArchived ? { isDeleted: true } : { isDeleted: { $ne: true } };
    const users = await User.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

/**
 * GET SINGLE USER BY ID (admin)
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ ok: false, message: "Invalid user id" });
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    return res.status(200).json({
      ok: true,
      data: user,
      user, // backward-friendly
    });
  } catch (error) {
    console.error("Error fetching user by id:", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

/**
 * UPDATE USER (admin)
 * - Never update password from this route
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ ok: false, message: "Invalid user id" });
    }

    const updates = { ...req.body };

    // Never update password here
    delete updates.password;

    // Normalize email if it’s being updated
    if (typeof updates.email === "string") {
      updates.email = normalizeEmail(updates.email);
    }

    // If email changed, prevent duplicates
    if (updates.email) {
      const dupe = await User.findOne({
        email: updates.email,
        _id: { $ne: id },
      });
      if (dupe) {
        return res.status(409).json({
          ok: false,
          message: "A user with this email already exists.",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    return res.status(200).json({
      ok: true,
      message: "User updated successfully",
      data: updatedUser,
      user: updatedUser, // backward-friendly
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

/**
 * DELETE USER (admin) — soft delete with dependency check
 * Returns warning if user has shipments. Pass ?force=true to archive anyway.
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const force = req.query.force === "true";
    console.log("DELETE USER query:", req.query, "url:", req.originalUrl);
    if (!isValidId(id)) {
      return res.status(400).json({ ok: false, message: "Invalid user id" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }
    // Hard delete — must check before the isDeleted guard
    if (user.isDeleted && req.query.hard === "true") {
      await User.findByIdAndDelete(id);
      return res.status(200).json({ ok: true, deleted: true, message: "Customer permanently deleted." });
    }

    if (user.isDeleted) {
      return res.status(400).json({ ok: false, message: "User is already archived." });
    }
    const [activeCount, totalCount] = await Promise.all([
      Shipment.countDocuments({
        customer: id,
        isDeleted: { $ne: true },
        status: { $in: ["request_received", "pending", "in_transit", "at_port", "customs_clearance"] },
      }),
      Shipment.countDocuments({ customer: id, isDeleted: { $ne: true } }),
    ]);
    if (!force && totalCount > 0) {
      return res.status(200).json({
        ok: true,
        warning: true,
        activeCount,
        totalCount,
        message: `This customer has ${totalCount} shipment${totalCount !== 1 ? "s" : ""} on record (${activeCount} active).`,
      });
    }
    user.isDeleted = true;
    user.status = "suspended";
    await user.save();
    return res.status(200).json({ ok: true, archived: true, message: "Customer archived successfully." });
  } catch (error) {
    console.error("Error archiving user:", error);
    return res.status(500).json({ ok: false, message: "Failed to archive user", error: error.message });
  }
};

const restoreUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ ok: false, message: "Invalid user id" });
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ ok: false, message: "User not found" });
    user.isDeleted = false;
    user.status = "active";
    await user.save();
    return res.status(200).json({ ok: true, message: "Customer restored successfully.", user });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Failed to restore user", error: error.message });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  restoreUser,
};
