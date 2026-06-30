import User from "../models/User.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { generateToken } from "../utils/token.js";

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { operatorId, password } = req.body;

    if (!operatorId || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const user = await User.findOne({ operatorId });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Access denied" });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
      id: user._id,
      operatorId: user.operatorId
    });

    res.status(200).json({
      token,
      operatorId: user.operatorId
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ================= SEED USER (ONE-TIME) ================= */
export const seedUser = async (req, res) => {
  try {
    const { operatorId, password } = req.body;

    if (!operatorId || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const exists = await User.findOne({ operatorId });
    if (exists) {
      return res.status(409).json({ message: "Operator already exists" });
    }

    const hashed = await hashPassword(password);

    await User.create({
      operatorId,
      password: hashed,
      isActive: true
    });

    res.status(201).json({ message: "Operator credential seeded" });
  } catch (err) {
    console.error("SEED ERROR:", err.message);
    res.status(500).json({ message: "Seeding failed" });
  }
};
