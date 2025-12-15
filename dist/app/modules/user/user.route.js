"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_controller_1 = require("./user.controller");
const express_1 = __importDefault(require("express"));
const userConstance_1 = require("./userConstance");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const user_validation_1 = require("./user.validation");
const router = express_1.default.Router();
router.post("/register", (0, validateRequest_1.default)(user_validation_1.registerUserSchema), user_controller_1.UserController.createUser);
router.get("/me", user_controller_1.UserController.getSingleUser);
router.get("/", (0, auth_1.default)(userConstance_1.UserRole.ADMIN), user_controller_1.UserController.getAllUsers);
router.patch("/profile", user_controller_1.UserController.UserUpdateProfile);
exports.UserRoutes = router;
