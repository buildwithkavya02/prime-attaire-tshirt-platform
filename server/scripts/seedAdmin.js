import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/config/db.js";
import Admin from "../src/models/Admin.js";
import mongoose from "mongoose";

async function run() {
  await connectDB();

  const name = process.env.ADMIN_NAME || "Admin";
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running this script.");
    process.exit(1);
  }

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`Admin with email ${email} already exists — nothing to do.`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await Admin.create({ name, email, passwordHash });

  console.log(`Admin account created: ${email}`);
  console.log("You can now log in from /admin/login with this email and the password from .env.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
