import express from 'express';
import {
  getStats,
  getAllUsers,
  toggleUserStatus,
  getAllGigs,
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.get('/gigs', getAllGigs);

export default router;