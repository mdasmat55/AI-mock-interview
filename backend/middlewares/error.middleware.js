module.exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack || err);

  const statusCode =
    err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;

  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error."
      : err.message || "Something went wrong on the server.";

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports.notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// Shared by controllers: classifies a caught error and sends the right
// status code + message instead of a blanket 500 for everything.
// - CastError: malformed MongoDB ObjectId in a route param (e.g. bad URL)
// - ValidationError: a schema rule was violated (e.g. bad enum value)
// - 11000: duplicate key on a unique index
// - anything else: a genuine server error, falls back to the generic message
module.exports.sendError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID.",
    });
  }

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
      message: "A record with this value already exists.",
    });
  }

  res.status(500).json({
    success: false,
    message: fallbackMessage,
  });
};
