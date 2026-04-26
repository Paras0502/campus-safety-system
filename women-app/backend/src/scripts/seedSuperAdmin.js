import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/User.js";
import generateUID from "../utils/generateUID.js";

// Load env vars
dotenv.config();

const seedSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campus-safety");
        console.log("MongoDB Connected...");

        // Check if a super admin already exists
        const existingSuperAdmin = await User.findOne({ role: "super_admin" });

        if (existingSuperAdmin) {
            console.log("⚠️ A super_admin already exists in the system.");
            console.log(`Current Super Admin: ${existingSuperAdmin.email}`);
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("masterkey123", salt);
        const uid = generateUID();

        const superAdmin = await User.create({
            uid,
            name: "System Director",
            email: "superadmin@paras.com",
            password: hashedPassword,
            role: "super_admin",
            isActive: true,
        });

        console.log("✅ Super Admin Account successfully seeded!");
        console.log("-----------------------------------------");
        console.log(`Email: superadmin@paras.com`);
        console.log(`Password: masterkey123`);
        console.log(`UID: ${superAdmin.uid}`);
        console.log("-----------------------------------------");
        console.log("Please login and immediately change this password if in a production environment.");

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding Error:", error);
        process.exit(1);
    }
};

seedSuperAdmin();
