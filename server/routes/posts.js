const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer storage (local disk). For production, consider S3/Cloudinary and set via env.
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

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB
const sharp = require('sharp');

// Helper: optimize image in place (rotate by EXIF, resize to max width, compress)
async function optimizeImage(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    let transformer = sharp(filePath).rotate().resize({ width: 1920, withoutEnlargement: true });

    if (ext === '.jpg' || ext === '.jpeg') transformer = transformer.jpeg({ quality: 85 });
    else if (ext === '.png') transformer = transformer.png({ compressionLevel: 9 });
    else if (ext === '.webp') transformer = transformer.webp({ quality: 85 });
    else transformer = transformer.jpeg({ quality: 85 });

    const outBuffer = await transformer.toBuffer();
    fs.writeFileSync(filePath, outBuffer);
    return true;
  } catch (err) {
    console.error('optimizeImage error:', err.message || err);
    return false;
  }
}

// @route GET /api/posts?page=1&limit=10&search=term&tag=tag
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, tag } = req.query;
    const query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (tag) {
      query.tags = tag.toLowerCase();
    }

    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Post.countDocuments(query);

    // Map mediaUrl -> image for legacy client code that expects `image`
    const postsOut = posts.map((p) => {
      const obj = p.toObject();
      if (obj.mediaType === 'image' && obj.mediaUrl) obj.image = obj.mediaUrl;
      return obj;
    });

    res.json({
      success: true,
      posts: postsOut,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/posts/:id
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'username avatar bio').populate('comments.user', 'username avatar');

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/posts
// Accepts either JSON body (mediaUrl) OR multipart/form-data with file field `media`.
router.post('/', protect, upload.single('media'), async (req, res) => {
  try {
    const { title, content, mediaUrl: bodyMediaUrl, mediaType: bodyMediaType, tags } = req.body;

    let mediaUrl = bodyMediaUrl || '';
    let mediaType = bodyMediaType || 'none';

    if (req.file) {
      // Construct absolute URL for uploaded file
      mediaUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
      // If image, run optimization (rotate, resize, compress)
      if (req.file.mimetype.startsWith('image/')) {
        const uploadedPath = path.join(uploadsDir, req.file.filename);
        try { await optimizeImage(uploadedPath); } catch (e) { console.error('Image optimize failed', e); }
      }
    }

    const post = await Post.create({
      author: req.user._id,
      title,
      content,
      mediaUrl,
      mediaType,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    });
    await post.populate('author', 'username avatar');

    const out = post.toObject();
    if (out.mediaType === 'image' && out.mediaUrl) out.image = out.mediaUrl;

    res.status(201).json({ success: true, post: out });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/posts/:id
router.put('/:id', protect, upload.single('media'), async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const { title, content, mediaUrl: bodyMediaUrl, mediaType: bodyMediaType, tags } = req.body;

    let mediaUrl = bodyMediaUrl || post.mediaUrl;
    let mediaType = bodyMediaType || post.mediaType;

    if (req.file) {
      mediaUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
      // Optimize images after upload
      if (req.file.mimetype.startsWith('image/')) {
        const uploadedPath = path.join(uploadsDir, req.file.filename);
        try { await optimizeImage(uploadedPath); } catch (e) { console.error('Image optimize failed', e); }
      }
    }

    post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content, mediaUrl, mediaType, tags: tags ? tags.split(',').map((t) => t.trim()) : post.tags },
      { new: true, runValidators: true }
    ).populate('author', 'username avatar');

    const out = post.toObject();
    if (out.mediaType === 'image' && out.mediaUrl) out.image = out.mediaUrl;

    res.json({ success: true, post: out });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route DELETE /api/posts/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/posts/:id/like
router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const liked = post.likes.includes(req.user._id);
    if (liked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();
    res.json({ success: true, likes: post.likes.length, liked: !liked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/posts/:id/comment
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.comments.push({ user: req.user._id, text: req.body.text });
    await post.save();
    await post.populate('comments.user', 'username avatar');
    res.status(201).json({ success: true, comments: post.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
