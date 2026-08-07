import express from "express";
import { initializePayment } from "../controllers/paymentController.js";

const router = express.Router();

// Initialize PayHere Payment
router.post("/init", initializePayment);

export default router;