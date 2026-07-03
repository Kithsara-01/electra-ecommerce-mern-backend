import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {

        // Get token from cookie
        const token = req.cookies.token;

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login."
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user
        const user = await User.findById(decoded.id).select("-password");

        // Check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found."
            });
        }

        // Attach user to request
        req.user = user;

        // Continue to next function
        next();

    } catch (error) {

        console.error("Authentication Error:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });

    }
};