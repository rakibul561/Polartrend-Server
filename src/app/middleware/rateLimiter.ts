import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 2, 
  message: {
    success: false,
    message: "You've tried to log in too many times. Try again after 1 minutes."
  }
});
