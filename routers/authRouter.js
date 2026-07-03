import express from "express";

import {
    registerCustomer,
    registerSupplier,
    loginUser,
    logoutUser
} from "../controllers/authController.js";

const authRouter = express.Router();


authRouter.post("/register/customer", registerCustomer); // Customer Register
authRouter.post("/register/supplier", registerSupplier); // Supplier Register
authRouter.post("/login", loginUser); // Login
authRouter.post("/logout", logoutUser); //

export default authRouter;