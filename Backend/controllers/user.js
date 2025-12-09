const mongoose = require("mongoose");
const User = require("../models/User");

/**
 * CREATE USER (Admin creates a CRM record)
 * --------------------------------------------------
 * Supports:
 * - accountType: Business / Individual
 * - fullname
 * - email
 * - phone
 * - country
 * - city
 * - postcode
 * - address
 * - role: Shipper / Consignee / Both / Admin
 * - notes
 * - status: active / pending / suspended
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

    // Basic validation (backend safety net)
    if (!fullname || !email || !phone) {
      return res
        .status(400)
        .json({ message: "fullname, email and phone are required." });
    }

    // Optional: prevent duplicate email accounts
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ message: "A user with this email already exists." });
    }

    const newUser = await User.create({
      accountType: accountType || "Business",
      fullname,
      email,
      phone,
      country,
      city,
      postcode,
      address,
      role: role || "Shipper",
      notes,
      status: status || "pending",
    });

    return res.status(201).json({
      message: "User created successfully.",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
};

/**
 * GET ALL USERS
 * --------------------------------------------------
 * Returns full CRM list sorted by newest.
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

/**
 * DELETE USER
 * --------------------------------------------------
 * Hard delete (for now). Can later convert to soft delete.
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "The user has been deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  deleteUser,
};
