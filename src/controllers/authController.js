const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const mailer = require('../utils/mailer');
const crypto = require('crypto');

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, legalStoreName, latitude, longitude, address, city, state, pincode } = req.body;    
    
    // Strict mobile number validation
    if (phone) {
      if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({ error: "Mobile number must be exactly 10 digits with no alphabets or special characters." });
      }
      const existingPhone = await prisma.user.findUnique({ where: { phone } });
      if (existingPhone) {
        return res.status(400).json({ error: "An account with this mobile number already exists." });
      }
    }

    // Check if the email is already taken
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email already exists. Please log in or use a different email." });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create User
    const newUser = await prisma.user.create({
      data: { name, email, phone, passwordHash, role: role || 'CUSTOMER' }
    });

    // Handle Pharmacy Owner logic
    if (role === 'OWNER') {
      await prisma.pharmacy.create({
        data: {
          ownerId: newUser.id,
          name: legalStoreName || name,
          status: 'PENDING',
          licenseNumber: `PENDING-${newUser.id}`,
          address: address && address.trim() ? address.trim() : "PENDING",
          city: city && city.trim() ? city.trim() : "PENDING",
          state: state && state.trim() ? state.trim() : "PENDING",
          pincode: pincode && pincode.trim() ? pincode.trim() : "000000",
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          gstDocumentUrl: req.files?.['gstDocument']?.[0]?.filename || null,
          panDocumentUrl: req.files?.['panDocument']?.[0]?.filename || null,
          licenseDocumentUrl: req.files?.['licenseDocument']?.[0]?.filename || null,
          addressProofUrl: req.files?.['addressProof']?.[0]?.filename || null
        }
      });
    }

    res.status(201).json({ message: "Registration successful", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Determine if input is email or phone
    let whereClause = {};
    if (email && email.includes('@')) {
      whereClause = { email: email.toLowerCase().trim() };
    } else if (email && /^\d{10}$/.test(email.trim())) {
      whereClause = { phone: email.trim() };
    } else {
      return res.status(400).json({ error: "Please enter a valid email or 10-digit mobile number." });
    }

    // Fetch user and include their Pharmacy data
    const user = await prisma.user.findUnique({ 
      where: whereClause, 
      include: { Pharmacy: true } 
    });
    
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ error: "This account has been deactivated." });
    }

    // 🚀 NEW: Admin Pipeline / Waiting Room Logic
    if (user.role === 'OWNER' && user.Pharmacy && user.Pharmacy.length > 0) {
      const pharmacy = user.Pharmacy[0];
      
      if (pharmacy.status === 'PENDING') {
        // Send a special flag to the frontend to redirect to the waiting page
        return res.json({ 
          success: true, 
          status: 'PENDING',
          redirect: 'pending-approval.html' 
        });
      }
      
      if (pharmacy.status === 'REJECTED') {
        // Block login entirely and show the reason
        return res.status(403).json({ 
          error: `Application Rejected. Reason: ${pharmacy.rejectionReason || 'Please contact support.'}` 
        });
      }
    }

    // Standard Login for Admins, Customers, and APPROVED Owners
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Set token in HttpOnly cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ 
      success: true, 
      user: { id: user.id, name: user.name, role: user.role, Pharmacy: user.Pharmacy },
      redirect: user.role === 'ADMIN' ? 'admin-dashboard.html' : (user.role === 'OWNER' ? 'pharmacy-dashboard.html' : 'index.html')
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

exports.getMe = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json(user);
};

exports.logout = (req, res) => {
  res.clearCookie('jwt');
  res.json({ success: true, message: 'Logged out successfully' });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Determine if input is email or phone
    let whereClause = {};
    if (email && email.includes('@')) {
      whereClause = { email: email.toLowerCase().trim() };
    } else if (email && /^\d{10}$/.test(email.trim())) {
      whereClause = { phone: email.trim() };
    } else {
      return res.status(400).json({ error: "Please enter a valid email or 10-digit mobile number." });
    }

    const user = await prisma.user.findUnique({ where: whereClause });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { resetOtp: otp, resetOtpExpiry: expiry }
    });

    await mailer.sendMail(user.email, 'Your Password Reset OTP', `Your OTP to reset your password is: ${otp}. It expires in 10 minutes.`);
    
    res.json({ success: true, message: "OTP sent to your registered email address.", email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process forgot password request." });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP, and new password are required." });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ error: "Invalid OTP." });
    }

    if (new Date() > new Date(user.resetOtpExpiry)) {
      return res.status(400).json({ error: "OTP has expired." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetOtp: null, resetOtpExpiry: null }
    });

    res.json({ success: true, message: "Password reset successful! You can now log in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reset password." });
  }
};