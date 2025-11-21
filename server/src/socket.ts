import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import User from './models/User';

export const initializeSocket = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const user = await User.findById(decoded.userId).select('-passwordHash');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.userId = user._id.toString();
      socket.data.username = user.username;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.data.username} connected`);

    // Join user to their personal room
    socket.join(`user:${socket.data.userId}`);

    // Handle real-time like
    socket.on('like_post', (data) => {
      socket.broadcast.emit('post_liked', {
        postId: data.postId,
        userId: socket.data.userId,
        username: socket.data.username
      });
    });

    // Handle real-time unlike
    socket.on('unlike_post', (data) => {
      socket.broadcast.emit('post_unliked', {
        postId: data.postId,
        userId: socket.data.userId,
        username: socket.data.username
      });
    });

    // Handle real-time comment
    socket.on('new_comment', (data) => {
      socket.broadcast.emit('comment_added', {
        postId: data.postId,
        comment: data.comment,
        userId: socket.data.userId,
        username: socket.data.username
      });
    });

    // Handle notifications
    socket.on('send_notification', (data) => {
      io.to(`user:${data.targetUserId}`).emit('notification', {
        type: data.type,
        message: data.message,
        fromUser: socket.data.username,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.data.username} disconnected`);
    });
  });

  return io;
};