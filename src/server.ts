import http, { Server } from "http";
import express from "express";
import app from "./app";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";
import './app/cron'





dotenv.config();

let server: Server | null = null;

async function connectDb() {
  try {
    await prisma.$connect();
    console.log("*** Database connected successfully!!");
  } catch (error) {
    console.log("*** Database connection failed!!");
    process.exit(1);
  }
}

async function startServer() {
  try {
    await connectDb();

    // ✅ HTTP server create
    server = http.createServer(app);

    // ✅ Initialize Socket.io



    // ✅ Server listen
    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });

    handleProcessEvents();
  } catch (error) {
    console.error("❌ Error during server startup:", error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string) {
  console.warn(`🔄 Received ${signal}, shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      console.log("✅ HTTP server closed.");

      try {
        await prisma.$disconnect();
        console.log("✅ Database disconnected.");
        console.log("Server shutdown complete.");
      } catch (error) {
        console.error("❌ Error during shutdown:", error);
      }

      process.exit(0);
    });
  } else {
    process.exit(0);
  }
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