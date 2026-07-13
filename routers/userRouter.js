import express from "express";

import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import {
    getMyProfile,
    updateMyProfile,
    changePassword,
    getAllUsers,
    getUserById,
    blockUser,
    unblockUser,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/profile", protect, getMyProfile); // Get My Profile
userRouter.put("/profile", protect, updateMyProfile); // Update My Profile
userRouter.put("/change-password", protect, changePassword); // Change Password

userRouter.get("/", protect, authorize("Admin"), getAllUsers); // Get All Users (Admin Only)
userRouter.get("/:id", protect, authorize("Admin"), getUserById); // Get Single User By ID (Admin Only)
userRouter.put("/:id/block", protect, authorize("Admin"), blockUser); // Block User (Admin Only)
userRouter.put("/:id/unblock", protect, authorize("Admin"), unblockUser); // Unblock User (Admin Only)

export default userRouter;
