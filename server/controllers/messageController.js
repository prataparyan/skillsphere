import mongoose from 'mongoose';
import Message from '../models/Message.js';

const getConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

export const getMessages = async (req, res) => {
  try {
    const conversationId = getConversationId(req.user.userId, req.params.userId);
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(req.user.userId) },
            { receiver: new mongoose.Types.ObjectId(req.user.userId) },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
        },
      },
    ]);
    res.status(200).json({ success: true, conversations: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};