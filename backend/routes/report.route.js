const express = require("express");

const { protect } = require("../middlewares/auth.middleware");

const { aiLimiter } = require("../middlewares/rateLimit.middleware");

const { createReport } = require("../controllers/report.controller");

const router = express.Router();

router.post("/:interviewId", protect, aiLimiter, createReport);

module.exports = router;
