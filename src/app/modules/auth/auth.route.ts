import express from "express";
import { AuthController } from "./auth.controller";
import { authRateLimiter } from "../../middleware/rateLimiter";
import validateRequest from "../../middleware/validateRequest";
import { loginSchema } from "./auth.validations";


 const router = express.Router();
  router.post(
  "/login",
  authRateLimiter,              
  validateRequest(loginSchema), 
  AuthController.login           
);

    router.post("/logout", AuthController.logout);

    export const AuthRoutes = router;
