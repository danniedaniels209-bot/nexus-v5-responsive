const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, trim: true, maxlength: 150 },
    content: { type: String, required: true, maxlength: 5000 },
    mediaUrl: { type: String, default: '' },
    mediaType: {
      type: String,
      enum: ['none', 'image', 'video', 'link'],
      default: 'none',
    },
    tags: [{ type: String, lowercase: true, trim: true }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [CommentSchema],
    views: { type: Number, default: 0 },

    // Competitive Social Features
    isRepost: { type: Boolean, default: false },
    originalPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    repostQuote: { type: String, maxlength: 500 },
    repostsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search
PostSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Post', PostSchema);
