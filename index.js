import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDB from "./database/db.js";
import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRouter.js";

dotenv.config();

connectDB();

const app = express();

app.use(express.json()); // Parse incoming JSON requests use for this to get data from req.body 
app.use(cookieParser()); // Parse cookies from incoming requests use for this to jwt token to work

app.use("/api/auth", authRouter); 
app.use("/api/users", userRouter);

const PORT = process.env.PORT || 3000; // Set the port to the value from environment variable or default to 3000

// Test Route
app.get("/", (req, res) => {

    res.send("Electra Backend Running...");

});

// Start the server
app.listen(PORT, () => {

    console.log(`Server Running on Port ${PORT} successfully✅`);

});