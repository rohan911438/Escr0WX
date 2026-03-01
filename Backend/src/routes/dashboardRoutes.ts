import { Router } from 'express';
import { DashboardController } from '@/controllers';
import { authMiddleware } from '@/middleware/auth';
import { rateLimitMiddleware } from '@/middleware/rateLimit';

const router = Router();
const dashboardController = new DashboardController();

// All dashboard routes require authentication
router.use(authMiddleware);

router.get('/stats', rateLimitMiddleware, dashboardController.getStats.bind(dashboardController));
router.get('/listings', rateLimitMiddleware, dashboardController.getUserListings.bind(dashboardController));
router.get('/purchases', rateLimitMiddleware, dashboardController.getUserPurchases.bind(dashboardController));

export default router;