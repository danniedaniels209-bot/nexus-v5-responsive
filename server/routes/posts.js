const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer storage
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) cb(null, true);
  else cb(new Error('Only image and video uploads are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });
const sharp = require('sharp');

async function optimizeImage(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    let transformer = sharp(filePath).rotate().resize({ width: 1920, withoutEnlargement: true });
    if (ext === '.jpg' || ext === '.jpeg') transformer = transformer.jpeg({ quality: 85 });
    else if (ext === '.png') transformer = transformer.png({ compressionLevel: 9 });
    else if (ext === '.webp') transformer = transformer.webp({ quality: 85 });
    const outBuffer = await transformer.toBuffer();
    fs.writeFileSync(filePath, outBuffer);
    return true;
  } catch (err) { return false; }
}

// @route GET /api/posts/trending
router.get('/trending', async (req, res) => {
  try {
    const tags = await Post.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json({ success: true, tags });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// @route GET /api/posts/following
router.get('/following', protect, async (req, res) => {
  try {
    const posts = await Post.find({ author: { $in: req.user.following } })
      .populate('author', 'username avatar isVerified')
      .populate('originalPost')
      .sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// @route GET /api/posts
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, tag } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    if (tag) query.tags = tag.toLowerCase();

    const posts = await Post.find(query)
      .populate('author', 'username avatar isVerified')
      .populate({
        path: 'originalPost',
        populate: { path: 'author', select: 'username avatar isVerified' }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Post.countDocuments(query);
    res.json({
      success: true,
      posts,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// @route POST /api/posts/:id/repost
router.post('/:id/repost', protect, async (req, res) => {
  try {
    const original = await Post.findById(req.params.id);
    if (!original) return res.status(404).json({ success: false, message: 'Post not found' });

    const repost = await Post.create({
      author: req.user._id,
      content: req.body.quote || 'Reposted',
      isRepost: true,
      originalPost: original._id,
      repostQuote: req.body.quote || '',
    });

    original.repostsCount += 1;
    await original.save();

    await repost.populate('author', 'username avatar isVerified');
    await repost.populate({
      path: 'originalPost',
      populate: { path: 'author', select: 'username avatar isVerified' }
    });

    res.status(201).json({ success: true, post: repost });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// @route PUT /api/posts/:id/save
router.put('/:id/save', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const isSaved = user.savedPosts.includes(req.params.id);

    if (isSaved) {
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== req.params.id);
    } else {
      user.savedPosts.push(req.params.id);
    }

    await user.save();
    res.json({ success: true, saved: !isSaved });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// @route GET /api/posts/:id
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('author', 'username avatar bio isVerified')
      .populate('comments.user', 'username avatar isVerified')
      .populate({
        path: 'originalPost',
        populate: { path: 'author', select: 'username avatar isVerified' }
      });

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Standard CRUD follows... (trimmed for brevity but keeping logic)
router.post('/', protect, upload.single('media'), async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    let mediaUrl = '';
    let mediaType = 'none';
    if (req.file) {
      mediaUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
      if (mediaType === 'image') await optimizeImage(path.join(uploadsDir, req.file.filename));
    }
    const post = await Post.create({
      author: req.user._id, title, content, mediaUrl, mediaType,
      tags: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
    });
    await post.populate('author', 'username avatar isVerified');
    res.status(201).json({ success: true, post });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const liked = post.likes.includes(req.user._id);
    if (liked) post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    else post.likes.push(req.user._id);
    await post.save();
    res.json({ success: true, likes: post.likes.length, liked: !liked });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/:id/comment', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({ user: req.user._id, text: req.body.text });
    await post.save();
    await post.populate('comments.user', 'username avatar isVerified');
    res.status(201).json({ success: true, comments: post.comments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.author.toString() !== req.user._id.toString()) return res.status(403).json({ success: false });
    await post.deleteOne();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
});

module.exports = router;
