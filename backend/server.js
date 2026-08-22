require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.route");
const userRoutes = require("./routes/user.route");
const interviewRoutes = require("./routes/interview.route");
const reportRoutes = require("./routes/report.route");
const { errorHandler, notFound } = require("./middlewares/error.middleware");
const app = express();

const PORT = process.env.PORT || 5000;

// Comma-separated list of allowed origins, e.g.
// CORS_ORIGIN=https://myapp.com,https://www.myapp.com
// Falls back to allowing any origin (useful for local dev) when unset.
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : null;

app.use(
  cors(
    allowedOrigins
      ? {
          origin: (origin, callback) => {
            // Allow requests with no origin (curl, mobile apps, server-to-server)
            if (!origin || allowedOrigins.includes(origin)) {
              return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
          },
        }
      : undefined,
  ),
);
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/reports", reportRoutes);

connectDB();

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Interview Platform API is running",
  });
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});