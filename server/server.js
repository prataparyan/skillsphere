import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import gigRoutes from './routes/gigRoutes.js';
import proposalRoutes from './routes/proposalRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import Message from './models/Message.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SkillSphere API is running' });
});

// Socket.IO
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.join(userId);
    console.log(`User ${userId} joined`);
  });

  socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
    try {
      const conversationId = [senderId, receiverId].sort().join('_');
      const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content,
        conversationId,
      });
      const populated = await message.populate('sender', 'name avatar');
      io.to(receiverId).emit('receiveMessage', populated);
      io.to(senderId).emit('receiveMessage', populated);
    } catch (error) {
      console.error('Socket message error:', error);
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) onlineUsers.delete(userId);
    });
    console.log('User disconnected:', socket.id);
  });
});

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});