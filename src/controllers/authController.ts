import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Import your custom interface so TypeScript knows exactly what req.user contains!
import { AuthenticatedRequest } from '../middleware/verifyToken'; 

// ==========================================
// 🔐 REGISTER USER SESSION
// ==========================================
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, photoUrl, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: "Email is already registered! 💎" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      name,
      email,
      photoUrl,
      password: hashedPassword
    });

    res.status(201).json({ success: true, message: "Registration successful! ✨" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error during registration." });
  }
};

// ==========================================
// 🔑 LOGIN USER SESSION
// ==========================================
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ success: false, message: "Invalid email or password parameters. 🐾" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: "Invalid email or password parameters. 🐾" });
      return;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none', 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully! 🌸",
      user: { name: user.name, email: user.email, photoUrl: user.photoUrl }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error during login authentication." });
  }
};

// ==========================================
// 🚪 LOGOUT USER SESSION
// ==========================================
export const logoutUser = (req: Request, res: Response): void => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
  res.status(200).json({ success: true, message: "Logged out clean! ✨" });
};

// ==========================================
// ✨ NEW: GET CURRENT LOGGED IN USER SESSION
// ==========================================
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Verified by your verifyToken middleware guard
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized token state." });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: "User account not found." });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error recovering user session data." });
  }
};

// ==========================================
// ✨ NEW: LIVE EDIT PROFILE DATA
// ==========================================
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, photoUrl } = req.body;

    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized action." });
      return;
    }

    // Safely update the fields based on the middleware decoded payload ID
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, photoUrl } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ success: false, message: "User workspace missing." });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully! 🌸",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        photoUrl: updatedUser.photoUrl
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error rewriting profile configuration." });
  }
};