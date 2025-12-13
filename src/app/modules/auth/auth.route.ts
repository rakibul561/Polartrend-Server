import express from "express";
import { AuthController } from "./auth.controller";
import { authRateLimiter } from "../../middleware/rateLimiter";


 const router = express.Router();

    router.post("/login",authRateLimiter, AuthController.login);
      router.post("/logout", AuthController.logout);

    export const AuthRoutes = router;
