const express = require("express");

const { protect } = require("../middlewares/auth.middleware");

const { createReport } = require("../controllers/report.controller");

const router = express.Router();

router.post("/:interviewId", protect, createReport);

module.exports = router;
