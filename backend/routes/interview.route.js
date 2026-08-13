const express = require("express");

const { protect } = require("../middlewares/auth.middleware");
const {
  createInterview,
} = require("../controllers/interview.controller");

const router = express.Router();

router.post("/create", protect, createInterview);

module.exports = router;