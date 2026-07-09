import Gig from '../models/Gig.js';

// @desc    Create a gig
// @route   POST /api/gigs
// @access  Private (client only)
export const createGig = async (req, res) => {
  try {
    const gig = await Gig.create({
      ...req.body,
      client: req.user.userId,
    });
    res.status(201).json({ success: true, gig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all gigs (with search + filter)
// @route   GET /api/gigs
// @access  Public
export const getGigs = async (req, res) => {
  try {
    const { search, category, status, minBudget, maxBudget, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (status) query.status = status;
    else query.status = 'open';
    if (minBudget || maxBudget) {
      query['budget.min'] = {};
      if (minBudget) query['budget.min'].$gte = Number(minBudget);
      if (maxBudget) query['budget.max'] = { $lte: Number(maxBudget) };
    }

    const skip = (page - 1) * limit;
    const total = await Gig.countDocuments(query);
    const gigs = await Gig.find(query)
      .populate('client', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      gigs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single gig
// @route   GET /api/gigs/:id
// @access  Public
export const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('client', 'name avatar email')
      .populate('assignedFreelancer', 'name avatar');

    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }
    res.status(200).json({ success: true, gig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update gig
// @route   PUT /api/gigs/:id
// @access  Private (gig owner only)
export const updateGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }
    if (gig.client.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updated = await Gig.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, gig: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete gig
// @route   DELETE /api/gigs/:id
// @access  Private (gig owner only)
export const deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }
    if (gig.client.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await gig.deleteOne();
    res.status(200).json({ success: true, message: 'Gig deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my gigs (client's own gigs)
// @route   GET /api/gigs/my-gigs
// @access  Private
export const getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ client: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, gigs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};