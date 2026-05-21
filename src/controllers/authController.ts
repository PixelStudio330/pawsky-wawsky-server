import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User';

// Import your custom interface so TypeScript knows exactly what req.user contains!
import { AuthenticatedRequest } from '../middleware/verifyToken'; 

// 🌸 Helper: Create a fresh client instance dynamically when requested
// This prevents keys from returning undefined on boot timing loops!
const getOAuth2Client = (): OAuth2Client => {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
};

// Helper function to dynamically get the correct backend redirect URI based on the environment
const getRedirectUri = (): string => {
  const backendBaseUrl = process.env.NODE_ENV === 'production'
    ? 'https://pawsky-wawsky-server.onrender.com'
    : process.env.BACKEND_URL || 'http://localhost:5000';
    
  return `${backendBaseUrl}/api/auth/google/callback`;
};

// ==========================================
// 🌐 GOOGLE OAUTH REDIRECT GATEWAY
// ==========================================
export const getGoogleAuthUrl = (req: Request, res: Response): void => {
  const oauth2Client = getOAuth2Client(); // 👈 Dynamic instance generation

  // Pass the dynamic redirect_uri straight into the options config!
  const authorizeUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    prompt: 'select_account',
    redirect_uri: getRedirectUri()
  });
  
  res.redirect(authorizeUrl);
};

// ==========================================
// 🔄 GOOGLE OAUTH CALLBACK PROCESSING CHANNEL
// ==========================================
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.query;
  const oauth2Client = getOAuth2Client(); // 👈 Dynamic instance generation
  
  const frontendTarget = process.env.NODE_ENV === 'production'
    ? 'https://pawsky-wawsky-client.vercel.app'
    : process.env.FRONTEND_URL || 'http://localhost:3000';

  if (!code) {
    res.redirect(`${frontendTarget}/login?error=no_auth_code`);
    return;
  }

  try {
    // Exchange callback authorization code using the exact same dynamic redirect_uri
    const { tokens } = await oauth2Client.getToken({
      code: code as string,
      redirect_uri: getRedirectUri()
    });
    oauth2Client.setCredentials(tokens);

    // Securely pull down profile credentials out of the token payload
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.redirect(`${frontendTarget}/login?error=invalid_payload`);
      return;
    }

    const { name, email, picture } = payload;

    // Check if the user workspace profile already exists inside MongoDB
    let user = await User.findOne({ email });

    if (!user) {
      // If new, create user record. (Pass an empty password since they use Google authentication)
      user = await User.create({
        name: name || 'Sanctuary Friend',
        email: email,
        photoUrl: picture || '',
        password: '' 
      });
    } else if (picture && !user.photoUrl) {
      // Keep user avatar dynamic if missing
      user.photoUrl = picture;
      await user.save();
    }

    // Generate your exact existing identity session token format structure
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    // Apply the authentication authorization token right back to cookies
    res.cookie('token', token, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none', 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    // Pass users safely right back to the frontend sanctuary landing spot!
    res.redirect(`${frontendTarget}/?login=success`);

  } catch (error) {
    console.error("Google authentication routine encountered an error:", error);
    res.redirect(`${frontendTarget}/login?error=oauth_failed`);
  }
};

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

    // Account check safely blocks credential logins if they've registered exclusively via Google OAuth
    if (!user.password) {
      res.status(400).json({ success: false, message: "Please log in using your Google account! 🌿" });
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
// ✨ GET CURRENT LOGGED IN USER SESSION
// ==========================================
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
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
// ✨ LIVE EDIT PROFILE DATA
// ==========================================
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, photoUrl } = req.body;

    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized action." });
      return;
    }

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