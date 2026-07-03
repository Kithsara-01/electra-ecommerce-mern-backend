import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDB from "./database/db.js";
import authRouter from "./routers/authRouter.js";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter); 

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {

    res.send("Electra Backend Running...");

});

app.listen(PORT, () => {

    console.log(`Server Running on Port ${PORT} successfully✅`);

});