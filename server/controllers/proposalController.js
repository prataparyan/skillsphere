import Proposal from '../models/Proposal.js';
import Gig from '../models/Gig.js';

export const submitProposal = async (req, res) => {
  try {
    const { gig, description, bidAmount, estimatedDays } = req.body;

    const gigDoc = await Gig.findById(gig);
    if (!gigDoc) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (gigDoc.status !== 'open') return res.status(400).json({ success: false, message: 'Gig is not open' });
    if (gigDoc.client.toString() === req.user.userId) {
      return res.status(400).json({ success: false, message: 'You cannot apply to your own gig' });
    }

    const proposal = await Proposal.create({
      gig, description, bidAmount, estimatedDays,
      freelancer: req.user.userId,
    });

    await Gig.findByIdAndUpdate(gig, { $inc: { proposalCount: 1 } });

    res.status(201).json({ success: true, proposal });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You already submitted a proposal for this gig' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGigProposals = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (gig.client.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const proposals = await Proposal.find({ gig: req.params.gigId })
      .populate('freelancer', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProposalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const proposal = await Proposal.findById(req.params.id).populate('gig');

    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
    if (proposal.gig.client.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    proposal.status = status;
    await proposal.save();

    if (status === 'accepted') {
      await Gig.findByIdAndUpdate(proposal.gig._id, {
        status: 'in-progress',
        assignedFreelancer: proposal.freelancer,
      });
    }

    res.status(200).json({ success: true, proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user.userId })
      .populate('gig', 'title budget status')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};