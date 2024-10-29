import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { Redis } from "ioredis";
import morgan from "morgan";
import { errorMiddleware } from "./middlewares/error.js";
import chatRoute from "./routes/chat.js";

dotenv.config({ path: "./.env" });

export const envMode = process.env.NODE_ENV?.trim() || "DEVELOPMENT";
const port = process.env.PORT || 4000;

// Access your API key as an environment variable (see "Set up your API key" above)
export const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const redis = new Redis(process.env.REDIS_URL!);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: [process.env.FRONTEND_URI!], credentials: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/v1", chatRoute);

// your routes here

app.get("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Page not found",
  });
});

app.use(errorMiddleware);

app.listen(port, () =>
  console.log("Server is working on Port:" + port + " in " + envMode + " Mode.")
);

redis.on("error", (err) => console.error("Redis Client Error", err));
redis.on("connect", () => console.log("Redis Connected"));
