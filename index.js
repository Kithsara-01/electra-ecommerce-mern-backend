import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectDB from "./database/db.js";
import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRouter.js";
import productRouter from "./routers/productRouter.js";

dotenv.config();

connectDB();

const app = express();

// this created for,                   
app.use( 
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true, 
  })
);

app.use(express.json()); // Parse incoming JSON requests 
app.use(cookieParser()); // Parse cookies from incoming requests use for this to jwt token to work

app.use("/api/auth", authRouter); 
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);

const PORT = process.env.PORT || 3000; // Set the port to the value from environment variable or default to 3000

// Test Route
app.get("/", (req, res) => {

    res.send("Electra Backend Running...");

});

// Start the server
app.listen(PORT, () => {

    console.log(`Server Running on Port ${PORT} successfully✅`);

});