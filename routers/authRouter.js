import express from "express";

import {
    registerCustomer,
    loginUser,
    logoutUser
} from "../controllers/authController.js";

const authRouter = express.Router();


authRouter.post("/register/customer", registerCustomer); // Customer Register
authRouter.post("/login", loginUser); // Login
authRouter.post("/logout", logoutUser); //

export default authRouter;