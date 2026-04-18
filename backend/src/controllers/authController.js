import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import generateUID from "../utils/generateUID.js";

// 🔐 Generate JWT Token
const generateToken = (user) => {
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

// ✅ REGISTER
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // 🔍 Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // 🔍 Check existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
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
            role: "student", // default
            isActive: true,
        });

        // 🎟 Generate token
        const token = generateToken(user);

        // ✅ Response (STRICT API CONTRACT)
        res.status(201).json({
            token,
            role: user.role,
            uid: user.uid,
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
            return res.status(400).json({ message: "All fields are required" });
        }

        // 🔍 Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 🔐 Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 🎟 Generate token
        const token = generateToken(user);

        // ✅ Response (STRICT API CONTRACT)
        res.status(200).json({
            token,
            role: user.role,
            uid: user.uid,
        });
    } catch (error) {
        next(error);
    }
};