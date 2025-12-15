"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("./auth.controller");
const rateLimiter_1 = require("../../middleware/rateLimiter");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const auth_validations_1 = require("./auth.validations");
const router = express_1.default.Router();
router.post("/login", rateLimiter_1.authRateLimiter, (0, validateRequest_1.default)(auth_validations_1.loginSchema), auth_controller_1.AuthController.login);
router.post("/logout", auth_controller_1.AuthController.logout);
exports.AuthRoutes = router;
