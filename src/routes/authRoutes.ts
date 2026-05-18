import { Router } from 'express';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser, // 👈 Import new controller handlers
  updateProfile 
} from '../controllers/authController';
import { verifyToken } from '../middleware/verifyToken'; // 👈 Import your validation guard middleware!

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// ==========================================
// 🛡️ SECURE PROTECTED PROFILE CHANNELS
// ==========================================
// These endpoints require a valid cookie token to let users pass!
router.get('/me', verifyToken, getCurrentUser);
router.put('/update-profile', verifyToken, updateProfile);

export default router;