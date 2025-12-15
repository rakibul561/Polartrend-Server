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
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = require("./lib/prisma");
require("./app/cron");
dotenv_1.default.config();
let server = null;
function connectDb() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield prisma_1.prisma.$connect();
            console.log("*** Database connected successfully!!");
        }
        catch (error) {
            console.log("*** Database connection failed!!");
            process.exit(1);
        }
    });
}
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield connectDb();
            // ✅ HTTP server create
            server = http_1.default.createServer(app_1.default);
            // ✅ Initialize Socket.io
            // ✅ Server listen
            const port = process.env.PORT || 5000;
            server.listen(port, () => {
                console.log(`🚀 Server is running on port ${port}`);
            });
            handleProcessEvents();
        }
        catch (error) {
            console.error("❌ Error during server startup:", error);
            process.exit(1);
        }
    });
}
function gracefulShutdown(signal) {
    return __awaiter(this, void 0, void 0, function* () {
        console.warn(`🔄 Received ${signal}, shutting down gracefully...`);
        if (server) {
            server.close(() => __awaiter(this, void 0, void 0, function* () {
                console.log("✅ HTTP server closed.");
                try {
                    yield prisma_1.prisma.$disconnect();
                    console.log("✅ Database disconnected.");
                    console.log("Server shutdown complete.");
                }
                catch (error) {
                    console.error("❌ Error during shutdown:", error);
                }
                process.exit(0);
            }));
        }
        else {
            process.exit(0);
        }
    });
}
function handleProcessEvents() {
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("uncaughtException", (error) => {
        console.error("💥 Uncaught Exception:", error);
        gracefulShutdown("uncaughtException");
    });
    process.on("unhandledRejection", (reason) => {
        console.error("💥 Unhandled Rejection:", reason);
        gracefulShutdown("unhandledRejection");
    });
}
// ✅ Start Application
startServer();
