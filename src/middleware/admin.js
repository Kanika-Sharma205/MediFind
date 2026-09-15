// src/middleware/admin.js
const isAdmin = (req, res, next) => {
  // We assume 'authenticateToken' ran first, which sets req.user
  if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN')) {
    next(); // They are an admin or super admin, proceed
  } else {
    res.status(403).json({ error: "Access Denied: Admins only." });
  }
};

const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'SUPER_ADMIN') {
    next();
  } else {
    res.status(403).json({ error: "Access Denied: Super Admins only." });
  }
};

module.exports = { isAdmin, isSuperAdmin };