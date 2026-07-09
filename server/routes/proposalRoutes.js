import express from 'express';
import {
  submitProposal,
  getGigProposals,
  updateProposalStatus,
  getMyProposals,
} from '../controllers/proposalController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, restrictTo('freelancer'), submitProposal);
router.get('/my-proposals', protect, restrictTo('freelancer'), getMyProposals);
router.get('/gig/:gigId', protect, restrictTo('client', 'admin'), getGigProposals);
router.put('/:id/status', protect, restrictTo('client', 'admin'), updateProposalStatus);

export default router;