export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;

  res.status(status).json({
    status: "error",
    endpoint: `${req.method} ${req.originalUrl}`,
    message: err.message || "Internal Server Error",
  });
};