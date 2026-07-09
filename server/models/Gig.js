import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [10, 'Title must be at least 10 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'web-development',
        'mobile-development',
        'design',
        'writing',
        'marketing',
        'video',
        'music',
        'data-science',
        'other',
      ],
    },
    budget: {
      min: { type: Number, required: true, min: 1 },
      max: { type: Number, required: true },
    },
    deadline: {
      type: Number,
      required: [true, 'Deadline is required'],
      min: [1, 'Deadline must be at least 1 day'],
    },
    skills: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['open', 'in-progress', 'completed', 'cancelled'],
      default: 'open',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    proposalCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for search performance
gigSchema.index({ title: 'text', description: 'text', skills: 'text' });
gigSchema.index({ category: 1, status: 1 });
gigSchema.index({ client: 1 });

const Gig = mongoose.model('Gig', gigSchema);
export default Gig;