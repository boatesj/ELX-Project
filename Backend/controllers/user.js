const mongoose = require("mongoose");
const User = require("../models/User");

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
    const users = await User.find({}).sort({ createdAt: -1 });

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
 * DELETE USER (admin)
 * Hard delete for now (as originally). (Later can become soft delete.)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ ok: false, message: "Invalid user id" });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    return res.status(200).json({
      ok: true,
      message: "The user has been deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
