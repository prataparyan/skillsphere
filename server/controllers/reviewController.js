import Review from '../models/Review.js';
import Gig from '../models/Gig.js';

export const createReview = async (req, res) => {
  try {
    const { gig, reviewee, rating, comment } = req.body;
    const gigDoc = await Gig.findById(gig);
    if (!gigDoc) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (gigDoc.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed gigs' });
    }
    const review = await Review.create({
      gig, reviewee, rating, comment,
      reviewer: req.user.userId,
    });
    res.status(201).json({ success: true, review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Already reviewed this gig' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .populate('gig', 'title')
      .sort({ createdAt: -1 });
    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    res.status(200).json({ success: true, reviews, avgRating: avgRating.toFixed(1) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};