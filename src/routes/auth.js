const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Register: Handles form data + 4 file uploads
router.post('/register', upload.fields([
  { name: 'gstDocument', maxCount: 1 },
  { name: 'panDocument', maxCount: 1 },
  { name: 'licenseDocument', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 }
]), authController.register);

// Login: Standard email/password check
router.post('/login', authController.login);

// Get Profile: Authenticated users can fetch their own data
router.get('/me', authenticateToken, authController.getMe);

const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { error: "Too many requests from this IP, please try again after 15 minutes" }
});

// Forgot Password
router.post('/forgot-password', otpLimiter, authController.forgotPassword);

// Reset Password
router.post('/reset-password', otpLimiter, authController.resetPassword);

// Logout
router.post('/logout', authController.logout);

module.exports = router;