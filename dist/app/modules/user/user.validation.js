"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerUserSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required"
    }),
    password: joi_1.default.string()
        .min(6)
        .max(30)
        .required()
        .messages({
        "string.min": "Password must be at least 6 characters long",
        "string.max": "Password must not exceed 30 characters",
        "any.required": "Password is required"
    }),
    name: joi_1.default.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
        "string.min": "Name must be at least 2 characters long",
        "string.max": "Name must not exceed 50 characters"
    }),
    role: joi_1.default.string()
        .valid("USER", "ADMIN")
        .optional()
        .messages({
        "any.only": "Role must be either USER or ADMIN"
    })
});
