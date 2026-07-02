import express from "express";
import dotenv from "dotenv";

import connectDB from "./database/db.js";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {

    res.send("Electra Backend Running...");

});

app.listen(PORT, () => {

    console.log(`Server Running on Port ${PORT}`);

});