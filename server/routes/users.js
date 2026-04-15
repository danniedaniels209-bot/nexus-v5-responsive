const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// @route GET /api/users/conversations
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar');

    const conversationsMap = new Map();

    messages.forEach((msg) => {
      const otherUser = msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;
      if (!otherUser) return;

      const otherId = otherUser._id.toString();
      if (!conversationsMap.has(otherId)) {
        conversationsMap.set(otherId, {
          user: otherUser,
          room: `dm_${[userId.toString(), otherId].sort().join('_')}`,
          lastMsg: msg,
          unread: !msg.read && msg.receiver?._id.toString() === userId.toString(),
        });
      }
    });

    res.json({ success: true, conversations: Array.from(conversationsMap.values()) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/users/id/:id
router.get('/id/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username avatar bio');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/users/search?q=query
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, users: [] });
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    }).select('username avatar bio followers').limit(10);
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/users/:username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const posts = await Post.find({ author: user._id })
      .populate('author', 'username avatar isVerified')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, user, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { bio, avatar },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route DELETE /api/users/me
router.delete('/me', protect, async (req, res) => {
  try {
    await Post.deleteMany({ author: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/users/:id/follow
router.put('/:id/follow', protect, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, message: "Can't follow yourself" });

    const targetUser = await User.findById(req.params.id);
    if (!targetUser)
      return res.status(404).json({ success: false, message: 'User not found' });

    const alreadyFollowing = req.user.following.includes(req.params.id);

    if (alreadyFollowing) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user._id } });
    }

    res.json({ success: true, following: !alreadyFollowing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
