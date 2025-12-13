import compression from "compression";
import cors from "cors";
import express from "express";
import router from "./app/routes";
import { glob } from "fs";
import globalErrorHandler from "./app/middleware/globalErrorHandaler";
import notFound from "./app/middleware/notFound";
import cookieParser from 'cookie-parser';



const app = express();



// Middleware
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


// Default route for testing
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});


// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});


app.use(globalErrorHandler)
app.use(notFound)




export default app;