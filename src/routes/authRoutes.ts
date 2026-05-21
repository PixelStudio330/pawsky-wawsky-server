import { Router } from 'express';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser, 
  updateProfile,
  getGoogleAuthUrl, // 👈 New handler
  googleCallback    // 👈 New handler
} from '../controllers/authController';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// ==========================================
// 🌐 GOOGLE OAUTH CHANNELS
// ==========================================
router.get('/google', getGoogleAuthUrl);          // GET /api/auth/google
router.get('/google/callback', googleCallback);  // GET /api/auth/google/callback

// ==========================================
// 🛡️ SECURE PROTECTED PROFILE CHANNELS
// ==========================================
router.get('/me', verifyToken, getCurrentUser);
router.put('/update-profile', verifyToken, updateProfile);

export default router;