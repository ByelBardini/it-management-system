import cors from 'cors';
import express from 'express';
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

export default app;