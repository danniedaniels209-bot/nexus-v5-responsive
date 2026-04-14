// @route DELETE /api/users/me — add before module.exports in users.js
router.delete('/me', protect, async (req, res) => {
  try {
    await Post.deleteMany({ author: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
