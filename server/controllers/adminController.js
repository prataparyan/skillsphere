import User from '../models/User.js';
import Gig from '../models/Gig.js';
import Proposal from '../models/Proposal.js';
import Message from '../models/Message.js';

export const getStats = async (req, res) => {
  try {
    const [totalUsers, totalGigs, totalProposals, recentUsers] = await Promise.all([
      User.countDocuments(),
      Gig.countDocuments(),
      Proposal.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt isActive'),
    ]);

    const freelancers = await User.countDocuments({ role: 'freelancer' });
    const clients = await User.countDocuments({ role: 'client' });
    const openGigs = await Gig.countDocuments({ status: 'open' });
    const inProgressGigs = await Gig.countDocuments({ status: 'in-progress' });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalGigs,
        totalProposals,
        freelancers,
        clients,
        openGigs,
        inProgressGigs,
      },
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot suspend admin' });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllGigs = async (req, res) => {
  try {
    const gigs = await Gig.find()
      .populate('client', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ success: true, gigs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};