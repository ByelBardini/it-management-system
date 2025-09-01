import cors from 'cors';
import express from 'express';
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from "express-session";

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
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SECRET_KEY_USER,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
      path: "/",
    },
  })
);

export default app;