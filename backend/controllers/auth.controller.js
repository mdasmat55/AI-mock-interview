const bcrypt = require("bcryptjs");

const User = require("../models/user.model");
const generateToken = require("../utils/jwt");

// Mongoose validation errors (e.g. password shorter than minlength) and
// duplicate-key errors (e.g. email unique index) are the user's fault, not
// the server's — they should come back as 400s with a useful message
// instead of a generic 500 "Server error".
const handleAuthError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);

  if (error.name === "ValidationError") {
    const message = Object.values(error.errors)
      .map((fieldError) => fieldError.message)
      .join(" ");

    return res.status(400).json({
      success: false,
      message: message || "Invalid input.",
    });
  }

  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "An account with this email already exists.",
    });
  }

  res.status(500).json({
    success: false,
    message: fallbackMessage,
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, skills, targetRole, education } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      skills: skills || [],
      targetRole: targetRole || "",
      education: education || "",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        targetRole: user.targetRole,
        education: user.education,
      },
    });
  } catch (error) {
    handleAuthError(res, error, "Server error");
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        targetRole: user.targetRole,
        education: user.education,
      },
    });
  } catch (error) {
    handleAuthError(res, error, "Server error");
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, skills, targetRole, education } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name ?? user.name;
    user.skills = skills ?? user.skills;
    user.targetRole = targetRole ?? user.targetRole;
    user.education = education ?? user.education;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        targetRole: user.targetRole,
        education: user.education,
      },
    });
  } catch (error) {
    handleAuthError(res, error, "Failed to update profile");
  }
};

module.exports = {
  register,
  login,
  updateProfile,
};
