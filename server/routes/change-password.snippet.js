// Add this route to server/routes/auth.js
// @route PUT /api/auth/change-password
// Already imported: protect middleware, User model, bcrypt

/*
router.put('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ success: false, message: 'Both passwords required' });
  if (newPassword.length < 6)
    return res.status(400).json({ success: false, message: 'New password min 6 chars' });

  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword)))
      return res.status(401).json({ success: false, message: 'Current password incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
*/

// Add this snippet directly into server/routes/auth.js before module.exports
