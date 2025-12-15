"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false
        });
        if (error) {
            const message = error.details
                .map(d => d.message)
                .join(", ");
            return next(new AppError_1.default(http_status_1.default.BAD_REQUEST, message));
        }
        next();
    };
};
exports.default = validateRequest;
