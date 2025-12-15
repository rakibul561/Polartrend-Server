"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../error/AppError"));
const jwtHelper_1 = require("../helpers/jwtHelper");
const auth = (...roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const token = req.cookies.accessToken;
            if (!token) {
                throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized!");
            }
            const secret = process.env.JWT_ACCESS_SECRET;
            const verifyUser = jwtHelper_1.jwtHelper.verifyToken(token, secret);
            req.user = verifyUser;
            if (roles.length && !roles.includes(verifyUser.role)) {
                throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized!");
            }
            next();
        }
        catch (err) {
            next(err);
        }
    });
};
exports.default = auth;
