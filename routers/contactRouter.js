import express from "express";

import {
  sendContactMessage,
  getAllContactMessages,
  getMyContactMessages,
  getMyContactMessageById,
  getUnreadMessageCount,
  getCustomerUnreadReplyCount,
  getContactMessageById,
  markMessageAsRead,
  replyToContactMessage,
  deleteContactMessage,
} from "../controllers/contactController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const contactRouter = express.Router();

// ==============================
// Customer
// ==============================
contactRouter.post("/", sendContactMessage);
contactRouter.get("/my-messages", protect, authorize("Customer"), getMyContactMessages);
contactRouter.get("/my-messages/:id", protect, authorize("Customer"), getMyContactMessageById);
contactRouter.get("/unread-replies-count", protect, authorize("Customer"), getCustomerUnreadReplyCount);

// ==============================
// Admin
// ==============================
contactRouter.get("/unread-count", protect, authorize("Admin"), getUnreadMessageCount);
contactRouter.get("/", protect, authorize("Admin"), getAllContactMessages);
contactRouter.get("/:id", protect, authorize("Admin"), getContactMessageById);
contactRouter.put("/:id/read", protect, authorize("Admin"), markMessageAsRead);
contactRouter.put("/:id/reply", protect, replyToContactMessage);
contactRouter.delete("/:id", protect, authorize("Admin"), deleteContactMessage);

export default contactRouter;