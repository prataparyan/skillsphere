import express from 'express';
import {
  createGig,
  getGigs,
  getGigById,
  updateGig,
  deleteGig,
  getMyGigs,
} from '../controllers/gigController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getGigs);
router.get('/my-gigs', protect, getMyGigs);
router.get('/:id', getGigById);
router.post('/', protect, restrictTo('client', 'admin'), createGig);
router.put('/:id', protect, restrictTo('client', 'admin'), updateGig);
router.delete('/:id', protect, restrictTo('client', 'admin'), deleteGig);

export default router;