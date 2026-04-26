import crypto from "crypto";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from "../utils/email.js";

const BCRYPT_ROUNDS = 12;
const PASSWORD_MIN = 12;
// Pre-computed once at startup — valid 60-char bcrypt hash required for timing-safe compare
const DUMMY_HASH = bcrypt.hashSync("__timing_dummy__", BCRYPT_ROUNDS);
// Requires at least: 1 uppercase, 1 lowercase, 1 digit, 1 special character
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_MAX = 100;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: "/api/auth",
};

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not configured");
  return process.env.JWT_SECRET;
};

const getJwtRefreshSecret = () => {
  if (!process.env.JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET not configured");
  return process.env.JWT_REFRESH_SECRET;
};

const generateAccessToken = (userId) =>
  jwt.sign({ userId }, getJwtSecret(), { expiresIn: "15m", algorithm: "HS256" });

const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, getJwtRefreshSecret(), { expiresIn: "7d", algorithm: "HS256" });

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length === 0 || trimmedName.length > NAME_MAX) {
      return res.status(400).json({ success: false, message: `Name must be between 1 and ${NAME_MAX} characters` });
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({ success: false, message: "Enter a valid email address" });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${PASSWORD_MIN} characters and include an uppercase letter, lowercase letter, number, and special character`,
      });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      budget: 0,
      transactions: [],
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("rt", refreshToken, COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          budget: user.budget,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error("Error in register:", error);
    return res.status(500).json({ success: false, message: "Server error during registration" });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({ success: false, message: "Enter a valid email address" });
    }

    const user = await User.findOne({ email: trimmedEmail });
    // Constant-time path: always run bcrypt.compare to prevent user-enumeration via timing
    const isValid = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, DUMMY_HASH).then(() => false);

    if (!user || !isValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("rt", refreshToken, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          budget: user.budget,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ success: false, message: "Server error during login" });
  }
};

// Refresh access token — reads refresh token from httpOnly cookie
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.rt;

    if (!token) {
      return res.status(401).json({ success: false, message: "No refresh token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, getJwtRefreshSecret(), { algorithms: ["HS256"] });
    } catch {
      res.clearCookie("rt", COOKIE_OPTIONS);
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    // Verify user still exists
    const user = await User.findById(decoded.userId).select("_id name email budget");
    if (!user) {
      res.clearCookie("rt", COOKIE_OPTIONS);
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    const newAccessToken = generateAccessToken(user._id);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        user: { id: user._id, name: user.name, email: user.email, budget: user.budget },
      },
    });
  } catch (error) {
    console.error("Error in refreshToken:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password -accessToken -plaidCursor");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error("Error in getMe:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Change password — authenticated user changes their own password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new passwords are required" });
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: `New password must be at least ${PASSWORD_MIN} characters and include an uppercase letter, lowercase letter, number, and special character`,
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: "New password must differ from your current password" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await User.findByIdAndUpdate(req.user.userId, { password: hashed });

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Forgot password — generates a reset token and emails it
export const forgotPassword = async (req, res) => {
  // Always return the same response to prevent user enumeration
  const SAFE_RESPONSE = {
    success: true,
    message: "If an account exists with that email, you'll receive reset instructions shortly.",
  };

  try {
    const { email } = req.body;

    if (!email || !EMAIL_REGEX.test(email.trim().toLowerCase())) {
      return res.status(400).json({ success: false, message: "Enter a valid email address" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(200).json(SAFE_RESPONSE);
    }

    // Generate a cryptographically random token — store only the hash in the DB
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

    await sendPasswordResetEmail(user.email, resetUrl);

    return res.status(200).json(SAFE_RESPONSE);
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Reset password — validates the token and sets a new password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Reset token is required" });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: "New password is required" });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${PASSWORD_MIN} characters and include an uppercase letter, lowercase letter, number, and special character`,
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({ success: false, message: "Reset link is invalid or has expired" });
    }

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await User.findByIdAndUpdate(user._id, {
      password: hashed,
      $unset: { resetPasswordToken: "", resetPasswordExpires: "" },
    });

    return res.status(200).json({ success: true, message: "Password reset successfully. You can now sign in." });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Logout — clear refresh token cookie
export const logout = async (req, res) => {
  try {
    res.clearCookie("rt", COOKIE_OPTIONS);
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
