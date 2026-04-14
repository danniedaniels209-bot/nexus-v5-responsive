const Message = require('../models/Message');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const onlineUsers = new Map(); // userId -> socketId

const initSocket = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);

    // Mark user online
    await User.findByIdAndUpdate(userId, { isOnline: true });

    // Broadcast online users
    io.emit('online_users', Array.from(onlineUsers.keys()));

    // Join global room
    socket.join('global');

    // Send recent global messages
    const recent = await Message.find({ room: 'global' })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    socket.emit('message_history', recent.reverse());

    // Handle global message
    socket.on('send_message', async (data) => {
      try {
        const msg = await Message.create({
          sender: userId,
          room: data.room || 'global',
          text: data.text,
        });
        await msg.populate('sender', 'username avatar');

        io.to(data.room || 'global').emit('new_message', msg);
      } catch (err) {
        socket.emit('error', err.message);
      }
    });

    // Handle private message
    socket.on('private_message', async (data) => {
      try {
        const msg = await Message.create({
          sender: userId,
          receiver: data.receiverId,
          room: `dm_${[userId, data.receiverId].sort().join('_')}`,
          text: data.text,
        });
        await msg.populate('sender', 'username avatar');

        const room = msg.room;
        // Emit to the room (both sender and receiver if they are joined)
        io.to(room).emit('new_private_message', msg);

        // Also emit to receiver directly in case they aren't in the room yet
        const receiverSocketId = onlineUsers.get(data.receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_private_message', msg);
        }
      } catch (err) {
        socket.emit('error', err.message);
      }
    });

    // Join a DM room
    socket.on('join_room', (room) => {
      socket.join(room);
    });

    // Get DM history
    socket.on('get_dm_history', async (data) => {
      try {
        const messages = await Message.find({ room: data.room })
          .populate('sender', 'username avatar')
          .sort({ createdAt: 1 });

        socket.emit('dm_history', { room: data.room, messages });

        // Mark messages as read
        await Message.updateMany(
          { room: data.room, receiver: userId, read: false },
          { $set: { read: true } }
        );
      } catch (err) {
        socket.emit('error', err.message);
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(data.room || 'global').emit('user_typing', {
        userId,
        username: data.username,
        room: data.room || 'global'
      });
    });

    socket.on('stop_typing', (data) => {
      socket.to(data.room || 'global').emit('user_stop_typing', {
        userId,
        room: data.room || 'global'
      });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: Date.now() });
      io.emit('online_users', Array.from(onlineUsers.keys()));
    });
  });
};

module.exports = initSocket;
