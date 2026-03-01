import { Router } from 'express';
import { AuthController } from '@/controllers';
import { authMiddleware } from '@/middleware/auth';
import { rateLimitMiddleware } from '@/middleware/rateLimit';

const router = Router();
const authController = new AuthController();

// Public auth routes
router.post('/challenge', rateLimitMiddleware, authController.generateChallenge.bind(authController));
router.post('/verify', rateLimitMiddleware, authController.verifySignature.bind(authController));

// Protected routes
router.get('/profile', authMiddleware, rateLimitMiddleware, authController.getProfile.bind(authController));

export default router;