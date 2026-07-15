import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Gig from '../models/Gig.js';
import Proposal from '../models/Proposal.js';
import Notification from '../models/Notification.js';


// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private (client only)
export const createOrder = async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const { gigId, proposalId } = req.body;

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }
    if (proposal.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Proposal must be accepted first' });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    // Amount in paise (Razorpay uses smallest currency unit)
    // 1 INR = 100 paise
    const amountInPaise = proposal.bidAmount * 100;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        gigId,
        proposalId,
        clientId: req.user.userId,
        freelancerId: proposal.freelancer.toString(),
      },
    });

    // Save pending payment
    const payment = await Payment.create({
      gig: gigId,
      proposal: proposalId,
      client: req.user.userId,
      freelancer: proposal.freelancer,
      amount: proposal.bidAmount,
      razorpayOrderId: order.id,
    });

    res.status(201).json({
      success: true,
      order,
      payment: payment._id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
  console.error('Payment create-order error:', error);
  res.status(500).json({ success: false, message: error.message });
}
};

// @desc    Verify payment after Razorpay callback
// @route   POST /api/payments/verify
// @access  Private (client only)
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed — invalid signature',
      });
    }

    // Update payment record
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'completed',
      },
      { new: true }
    );

    // Mark gig as completed
    await Gig.findByIdAndUpdate(payment.gig, { status: 'completed' });

    // Notify freelancer
    await Notification.create({
      recipient: payment.freelancer,
      type: 'new_message',
      message: `Payment of ₹${payment.amount} received for your completed work!`,
      link: `/gigs/${payment.gig}`,
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/my-payments
// @access  Private
export const getMyPayments = async (req, res) => {
  try {
    const query =
      req.user.role === 'client'
        ? { client: req.user.userId }
        : { freelancer: req.user.userId };

    const payments = await Payment.find(query)
      .populate('gig', 'title')
      .populate('client', 'name')
      .populate('freelancer', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};