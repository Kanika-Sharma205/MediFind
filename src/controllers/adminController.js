const prisma = require('../lib/prisma');

const crypto = require('crypto');

// Approve a pharmacy
exports.approvePharmacy = async (req, res) => {
    try {
        const pharmacy = await prisma.pharmacy.update({
            where: { id: req.params.id },
            data: { status: 'APPROVED', rejectionReason: null }
        });
        
        await prisma.auditLog.create({
            data: {
                id: crypto.randomUUID(),
                action: 'PHARMACY_APPROVED',
                entityType: 'PHARMACY',
                entityId: pharmacy.id,
                performedBy: req.user.id,
                metadata: {
                    adminName: req.user.name,
                    adminEmail: req.user.email,
                    pharmacyName: pharmacy.name
                }
            }
        });

        res.json({ success: true, message: "Pharmacy approved successfully!" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Server error" });
    }
};

exports.rejectPharmacy = async (req, res) => {
    try {
        const { reason } = req.body;
        const pharmacy = await prisma.pharmacy.update({
            where: { id: req.params.id },
            data: { status: 'REJECTED', rejectionReason: reason || "Did not meet platform guidelines." }
        });
        
        await prisma.auditLog.create({
            data: {
                id: crypto.randomUUID(),
                action: 'PHARMACY_REJECTED',
                entityType: 'PHARMACY',
                entityId: pharmacy.id,
                performedBy: req.user.id,
                metadata: {
                    adminName: req.user.name,
                    adminEmail: req.user.email,
                    pharmacyName: pharmacy.name,
                    reason: reason || "Did not meet platform guidelines."
                }
            }
        });

        res.json({ success: true, message: "Pharmacy application rejected." });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not fetch audit logs." });
    }
};

exports.getRecentCustomers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { role: 'CUSTOMER' },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not fetch customer registrations." });
    }
};

exports.getRecentPharmacies = async (req, res) => {
    try {
        const pharmacies = await prisma.pharmacy.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: { owner: { select: { name: true, email: true } } }
        });
        res.status(200).json(pharmacies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not fetch pharmacy registrations." });
    }
};

// Get all pending pharmacies for the admin dashboard
exports.getPendingPharmacies = async (req, res) => {
  try {
    const pending = await prisma.pharmacy.findMany({
      where: { status: 'PENDING' },
      include: { owner: true }
    });
    res.status(200).json(pending);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch pending requests." });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const pharmaciesCount = await prisma.pharmacy.count({ where: { status: 'APPROVED', isAvailable: true } });
    const usersCount = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const reservationsCount = await prisma.reservation.count();
    const pendingCount = await prisma.pharmacy.count({ where: { status: 'PENDING' } });

    res.json({
      pharmacies: pharmaciesCount,
      users: usersCount,
      reservations: reservationsCount,
      pending: pendingCount
    });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch dashboard stats." });
  }
};

const bcrypt = require('bcryptjs');
const mailer = require('../utils/mailer');

exports.enrollAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "User already exists with this email." });

    const tempPassword = crypto.randomBytes(4).toString('hex'); // 8 char random password
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const newAdmin = await prisma.user.create({
      data: {
        name: 'New Admin',
        email,
        passwordHash,
        role: 'ADMIN'
      }
    });

    await mailer.sendMail(email, 'Your Admin Account', `An admin account has been created for you.\nYour temporary password is: ${tempPassword}\nPlease log in and use the forgot password flow to change it if needed.`);
    
    res.json({ success: true, message: "Admin enrolled successfully. Temporary password emailed." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to enroll admin." });
  }
};

exports.removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent super admins from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ error: "Cannot remove yourself." });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return res.status(404).json({ error: "User not found." });

    // Soft delete by deactivating
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    await prisma.auditLog.create({
        data: {
            id: crypto.randomUUID(),
            action: 'USER_REMOVED',
            entityType: 'USER',
            entityId: targetUser.id,
            performedBy: req.user.id,
            metadata: { userEmail: targetUser.email, role: targetUser.role }
        }
    });

    res.json({ success: true, message: "User removed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to remove user." });
  }
};

exports.fileComplaint = async (req, res) => {
  try {
    const { reportedId, issueType, description } = req.body;
    if (!reportedId || !issueType) {
      return res.status(400).json({ error: "Reported user ID and issue type are required." });
    }

    const complaint = await prisma.complaint.create({
      data: {
        reportedId,
        reporterId: req.user.id,
        issueType,
        description
      }
    });

    res.json({ success: true, message: "Complaint filed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to file complaint." });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reported: { select: { name: true, email: true, role: true } },
        reporter: { select: { name: true, email: true } }
      }
    });
    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch complaints." });
  }
};