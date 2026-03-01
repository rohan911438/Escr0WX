import { Router } from 'express';
import { DashboardController } from '@/controllers';
import { authMiddleware } from '@/middleware/auth';
import { rateLimitMiddleware } from '@/middleware/rateLimit';

const router = Router();
const dashboardController = new DashboardController();

// Public user routes
router.get('/:address/dashboard', rateLimitMiddleware, dashboardController.getPublicDashboard.bind(dashboardController));

export default router;