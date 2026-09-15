// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const authenticateToken = async (req, res, next) => {
  let token = req.cookies && req.cookies.jwt;
  
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
  }

  if (!token) return res.status(401).json({ error: 'Access token missing.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    const user = await prisma.user.findUnique({
      where: { id: decoded.id || decoded.userId },
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) return res.status(403).json({ error: 'Account inactive.' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token expired.' });
  }
};

const authenticate = authenticateToken;

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const userRole = String(req.user.role || '').toUpperCase();
  const normalizedAllowedRoles = allowedRoles.map((role) => String(role).toUpperCase());

  if (normalizedAllowedRoles.includes(userRole)) {
    return next();
  }

  return res.status(403).json({ error: 'Forbidden.' });
};

module.exports = { authenticateToken, authenticate, authorize };