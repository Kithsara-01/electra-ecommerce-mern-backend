import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// Customer Register
export const registerCustomer = async (req, res) => {
    try {

        // Get data from request body
        const { name, email, password, phone, address } = req.body;

        // Validate required fields
        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        // Check whether email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        // Create new customer
        const newCustomer = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            role: "Customer"
        });

        // Send response (without password)
        return res.status(201).json({
            success: true,
            message: "Customer account created successfully.",
            user: {
                id: newCustomer._id,
                name: newCustomer.name,
                email: newCustomer.email,
                phone: newCustomer.phone,
                address: newCustomer.address,
                role: newCustomer.role,
                isBlocked: newCustomer.isBlocked,
                createdAt: newCustomer.createdAt,
                updatedAt: newCustomer.updatedAt
            }
        });

    } catch (error) {
        console.error("Register Customer Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }

};

// Supplier Register
export const registerSupplier = async (req, res) => {
     try {

        // Get data from request body
        const { name, email, password, phone, address } = req.body;

        // Validate required fields
        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        // Check whether email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new supplier
        const newSupplier = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            role: "Supplier"
        });

        // Send response (without password)
        return res.status(201).json({
            success: true,
            message: "Supplier account created successfully.",
            user: {
                id: newSupplier._id,
                name: newSupplier.name,
                email: newSupplier.email,
                phone: newSupplier.phone,
                address: newSupplier.address,
                role: newSupplier.role,
                isBlocked: newSupplier.isBlocked,
                createdAt: newSupplier.createdAt,
                updatedAt: newSupplier.updatedAt
            }
        });

    } catch (error) {
        console.error("Register Supplier Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }

};

// Login (Admin / Customer / Supplier)
export const loginUser = async (req, res) => {
    try {

        // Get data from request body
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter email and password."
            });
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Check if user is blocked
        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked. Please contact the administrator."
            });
        }

        // Generate JWT Token
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Store token in HTTP Only Cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days
        });

        // Send response
        return res.status(200).json({
            success: true,
            message: "Login successful.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                profileImage: user.profileImage,
                isBlocked: user.isBlocked,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }

};

// Logout User
export const logoutUser = async (req, res) => {
    try {

        // Clear the authentication cookie
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/"
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully."
        });

    } catch (error) {

        console.error("Logout Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};