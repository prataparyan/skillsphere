import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, minlength: 10 },
  },
  { timestamps: true }
);

reviewSchema.index({ gig: 1, reviewer: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;