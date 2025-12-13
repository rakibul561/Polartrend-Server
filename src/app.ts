import compression from "compression";
import cors from "cors";
import express from "express";
import router from "./app/routes";
import globalErrorHandler from "./app/middleware/globalErrorHandaler";
import notFound from "./app/middleware/notFound";
import cookieParser from 'cookie-parser';
import { authRateLimiter } from "./app/middleware/rateLimiter";
import morgan from "morgan";

const app = express();
app.use(morgan("dev"));
app.use(cors()); 
app.use(compression()); 
app.use(express.json()); 
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/v1", router)

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});


app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

app.use(authRateLimiter)

app.use(globalErrorHandler)
app.use(notFound)




export default app;