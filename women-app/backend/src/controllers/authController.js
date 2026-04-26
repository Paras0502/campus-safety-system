import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import generateUID from "../utils/generateUID.js";

// 🔐 Generate Access Token
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            uid: user.uid,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m",
        }
    );
};

// 🔐 Generate Refresh Token
const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            uid: user.uid,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
};

const setRefreshTokenCookie = (res, token) => {
    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

// ✅ REGISTER
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // 🔍 Validation
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // 🔍 Check existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // 🔐 Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 🆔 Generate UID
        const uid = generateUID();

        // 👤 Create user
        const user = await User.create({
            uid,
            name,
            email,
            password: hashedPassword,
            role: "student",
            isActive: true,
        });

        // 🎟 Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        setRefreshTokenCookie(res, refreshToken);

        // ✅ Response
        res.status(201).json({
            success: true,
            message: "Registration successful",
            data: {
                token: accessToken,
                role: user.role,
                uid: user.uid,
            }
        });
    } catch (error) {
        next(error);
    }
};

// ✅ LOGIN
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 🔍 Validation
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // 🔍 Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // ❗ NEW: Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "Account is deactivated" });
        }

        // 🔐 Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // 🎟 Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        setRefreshTokenCookie(res, refreshToken);

        // ✅ Response
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token: accessToken,
                role: user.role,
                uid: user.uid,
            }
        });
    } catch (error) {
        next(error);
    }
};

// ✅ REFRESH TOKEN
export const refreshToken = async (req, res, next) => {
    try {
        const rfToken = req.cookies.refreshToken;
        if (!rfToken) {
            return res.status(401).json({ success: false, message: "Not authorized, no refresh token" });
        }

        const decoded = jwt.verify(rfToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: "Not authorized, account deactivated or missing" });
        }

        const accessToken = generateAccessToken(user);

        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: {
                token: accessToken,
                role: user.role,
                uid: user.uid,
            }
        });
    } catch (error) {
        return res.status(401).json({ success: false, message: "Not authorized, invalid refresh token" });
    }
};

// ✅ LOGOUT
export const logoutUser = (req, res) => {
    res.cookie("refreshToken", "", {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: "Logged out successfully" });
};

