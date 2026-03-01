import { Router } from 'express';
import { ListingController } from '@/controllers';
import { authMiddleware } from '@/middleware/auth';
import { rateLimitMiddleware } from '@/middleware/rateLimit';

const router = Router();
const listingController = new ListingController();

// Public routes
router.get('/', rateLimitMiddleware, listingController.getListings.bind(listingController));
router.get('/:id', rateLimitMiddleware, listingController.getListingById.bind(listingController));

// Protected routes (require authentication)
router.post('/', authMiddleware, rateLimitMiddleware, listingController.createListing.bind(listingController));
router.put('/:id', authMiddleware, rateLimitMiddleware, listingController.updateListing.bind(listingController));
router.post('/:id/proof', authMiddleware, rateLimitMiddleware, listingController.submitProof.bind(listingController));

export default router;