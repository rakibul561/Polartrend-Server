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
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../../lib/prisma");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcryptjs_1.default.hash(payload.password, 10);
    const userData = {
        email: payload.email,
        password: hashedPassword,
        name: payload.name,
        role: payload.role || "USER"
    };
    const result = yield prisma_1.prisma.user.create({
        data: userData,
        select: {
            id: true,
            email: true,
            role: true,
            name: true,
            createdAt: true,
            updatedAt: true
        }
    });
    return result;
});
const getSingleUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("User ID in service:", userId);
    const user = yield prisma_1.prisma.user.findUniqueOrThrow({
        where: { id: userId }
    });
    return user;
});
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.prisma.user.findMany({});
    const totalUser = yield prisma_1.prisma.user.count();
    return {
        meta: {
            total: totalUser
        },
        data: {
            user
        }
    };
});
const UserUpdateProfile = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedUser = yield prisma_1.prisma.user.update({
        where: { id: userId },
        data: payload
    });
    return updatedUser;
});
exports.UserService = {
    createUser,
    getSingleUser,
    getAllUsers,
    UserUpdateProfile
};
