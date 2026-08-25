const express = require("express");

const {
  register,
  login,
  updateProfile,
} = require("../controllers/auth.controller");

const { protect } = require("../middlewares/auth.middleware");
const { authLimiter } = require("../middlewares/rateLimit.middleware");

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.put("/profile", protect, updateProfile);

module.exports = router;
