const express = require("express");
const multer = require("multer");
const prisma = require("../lib/prisma");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const serializePrescription = (prescription) => ({
  id: prescription.id,
  fileUrl: prescription.fileUrl,
  status: prescription.status,
  createdAt: prescription.createdAt,
  user: prescription.user
    ? {
        id: prescription.user.id,
        name: prescription.user.name,
        email: prescription.user.email,
      }
    : undefined,
});

router.post(
  "/",
  authenticate,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const { fileUrl } = req.body;
    const file = req.file;

    if (!file && (!fileUrl || !String(fileUrl).trim())) {
      throw new HttpError(400, "A prescription file or file URL is required");
    }

    const resolvedFileUrl = fileUrl && String(fileUrl).trim() ? String(fileUrl).trim() : `/uploads/prescriptions/${Date.now()}-${file.originalname}`;

    const prescription = await prisma.prescription.create({
      data: {
        userId: req.user.id,
        fileUrl: resolvedFileUrl,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: serializePrescription(prescription),
    });
  })
);

router.get(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    const where = req.user.role === "CUSTOMER" ? { userId: req.user.id } : {};

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        User: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: prescriptions.map(serializePrescription),
    });
  })
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("PHARMACIST", "PHARMACY_OWNER", "ADMIN"),
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const allowedStatuses = ["APPROVED", "REJECTED"];

    if (!allowedStatuses.includes(status)) {
      throw new HttpError(400, "Invalid prescription status");
    }

    const prescription = await prisma.prescription.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: `SET_PRESCRIPTION_${status}`,
        entityType: "Prescription",
        entityId: prescription.id,
        performedBy: req.user.id,
      },
    });

    res.json({
      success: true,
      data: serializePrescription(prescription),
    });
  })
);

module.exports = router;
