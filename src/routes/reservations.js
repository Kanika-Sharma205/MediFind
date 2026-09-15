const express = require("express");
const crypto = require("crypto");
const multer = require("multer"); 
const fs = require("fs");
const path = require("path");
const prisma = require("../lib/prisma");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// 🚀 FIX: Physically save the files to a real 'uploads' folder on the hard drive
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Replaces spaces with underscores so the URL doesn't break
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 10 * 1024 * 1024 } 
});

// ==========================================
// GET: Fetch reservations
// ==========================================
router.get(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    const where = req.user.role === "CUSTOMER" 
      ? { userId: req.user.id } 
      : req.query.pharmacyId 
        ? { pharmacyId: String(req.query.pharmacyId) } 
        : {};

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        User: { select: { id: true, name: true, email: true } },
        Pharmacy: true,
        Items: { include: { Medicine: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch batch prices for all items in these reservations
    const batchIds = reservations.flatMap(resv => resv.Items.map(item => item.batchId).filter(Boolean));
    const uniqueBatchIds = [...new Set(batchIds)];
    
    let batchMap = {};
    if (uniqueBatchIds.length > 0) {
      const batches = await prisma.medicineBatch.findMany({
        where: { id: { in: uniqueBatchIds } },
        select: { id: true, sellingPrice: true }
      });
      batches.forEach(b => {
        batchMap[b.id] = Number(b.sellingPrice);
      });
    }

    const formattedData = reservations.map(resv => {
      const firstItem = resv.Items[0];
      const code = `MF-${resv.id.split('-')[0].toUpperCase()}`;

      return {
        ...resv,
        reservationCode: code,
        pharmacyName: resv.Pharmacy ? resv.Pharmacy.name : "Unknown Pharmacy",
        medicineName: firstItem?.Medicine
          ? firstItem.Medicine.brandName
          : (resv.orderType === "PRESCRIPTION_ONLY" ? "Prescription order — awaiting review" : "Unknown Medicine"),
        quantity: firstItem ? firstItem.quantity : 0,
        Items: resv.Items.map(item => ({
          ...item,
          MedicineBatch: { sellingPrice: batchMap[item.batchId] || 0 }
        })),
      };
    });

    res.json({ success: true, data: formattedData });
  })
);

// ==========================================
// POST: Create a new reservation and DEDUCT STOCK
// ==========================================
router.post(
  "/", 
  authenticate,
  upload.array("prescriptions", 5),
  asyncHandler(async (req, res) => {
    let cartItems = [];
    let pharmacyId = req.body.pharmacyId;
    const customerNote = req.body.note ? String(req.body.note).trim() : null;

    if (req.body.mode === "prescription_only") {
      if (!pharmacyId) {
        throw new HttpError(400, "Please choose a pharmacy for this prescription order.");
      }

      const files = req.files || [];
      if (files.length === 0) {
        throw new HttpError(400, "Please attach at least one prescription file.");
      }

      // 🚀 FIX: Use file.filename instead of file.originalname
      const uploadedUrls = files.map(file => `/uploads/${file.filename}`);

      const reservation = await prisma.reservation.create({
        data: {
          userId: req.user.id,
          pharmacyId: pharmacyId,
          status: "AWAITING_REVIEW",
          orderType: "PRESCRIPTION_ONLY",
          customerNote: customerNote,
          prescriptionUrls: uploadedUrls,
        },
        include: { Items: true },
      });

      const generatedCode = `MF-${reservation.id.split('-')[0].toUpperCase()}`;
      return res.status(201).json({
        success: true,
        data: { ...reservation, reservationCode: generatedCode },
      });
    }

    if (req.body.cart) {
      cartItems = JSON.parse(req.body.cart);
    } 
    else if (req.body.medicineId) {
      let targetBatchId = req.body.batchId;
      
      if (!targetBatchId) {
        const foundBatch = await prisma.medicineBatch.findFirst({
          where: { 
            medicineId: req.body.medicineId, 
            pharmacyId: pharmacyId 
          }
        });
        
        if (!foundBatch) {
          throw new HttpError(400, "Inventory not found for this pharmacy.");
        }
        targetBatchId = foundBatch.id;
      }

      cartItems = [{
        medicineId: req.body.medicineId,
        batchId: targetBatchId, 
        quantity: Number(req.body.quantity || 1)
      }];
    } 
    else {
      throw new HttpError(400, "Missing reservation data");
    }

    const batchIds = cartItems.map(item => item.batchId);
    const batchesWithStock = await prisma.medicineBatch.findMany({
      where: { id: { in: batchIds } },
      include: { StockTransaction: true }
    });

    for (const cartItem of cartItems) {
      const batch = batchesWithStock.find(b => b.id === cartItem.batchId);
      if (!batch) {
        throw new HttpError(400, `Batch not found for one of the items in your cart.`);
      }

      const currentStock = batch.StockTransaction.reduce(
        (sum, tx) => sum + (tx.type === "PURCHASE" ? tx.quantity : -tx.quantity),
        0
      );
      const availableStock = Math.max(0, currentStock);

      if (Number(cartItem.quantity) > availableStock) {
        throw new HttpError(
          400,
          `Only ${availableStock} unit(s) available for this item — you requested ${cartItem.quantity}.`
        );
      }
    }

    const medicineIds = cartItems.map(item => item.medicineId);
    const medicines = await prisma.medicine.findMany({
      where: { id: { in: medicineIds } }
    });

    const requiresPrescription = medicines.some(med => med.prescriptionRequired === true || med.isRestricted === true);
    const files = req.files || [];

    if (requiresPrescription && files.length === 0) {
      throw new HttpError(400, "A prescription file is required for one or more medicines in your cart.");
    }
    
    // 🚀 FIX: Use file.filename here as well
    const uploadedUrls = files.map(file => `/uploads/${file.filename}`); 

    const reservation = await prisma.$transaction(async (tx) => {
      const resv = await tx.reservation.create({
        data: {
          userId: req.user.id,
          pharmacyId: pharmacyId,
          status: "PENDING", 
          orderType: "ITEM_BASED",
          customerNote: customerNote,
          prescriptionUrls: uploadedUrls,
          Items: {
            create: cartItems.map(item => ({
              batchId: item.batchId,
              medicineId: item.medicineId,
              quantity: Number(item.quantity)
            }))
          }
        },
        include: { Items: true }
      });

      for (const item of cartItems) {
        await tx.stockTransaction.create({
          data: {
            id: crypto.randomUUID(), 
            batchId: item.batchId,
            type: "RESERVATION", 
            quantity: Number(item.quantity),
            remarks: `Stock held for Order #${resv.id}`
          }
        });
      }
      return resv;
    });

    const generatedCode = `MF-${reservation.id.split('-')[0].toUpperCase()}`;
    
    res.status(201).json({ 
      success: true, 
      data: { 
        ...reservation, 
        reservationCode: generatedCode 
      } 
    });  
  })
);

// ==========================================
// PATCH: Pharmacist Accepts, Rejects, or Approves (Token Verify)
// ==========================================
router.patch(
  "/:pharmacyId/reservations/:reservationId",
  authenticate,
  authorize("PHARMACIST", "OWNER"),
  asyncHandler(async (req, res) => {
    const { action } = req.body; 

    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.reservationId },
      include: { Items: true }
    });

    if (!reservation) {
      throw new HttpError(404, "Reservation not found");
    }
    
    // Validate: Can only modify if PENDING (to accept/reject) or ACCEPTED (to verify token)
    if (reservation.status !== "PENDING" && reservation.status !== "ACCEPTED") {
      throw new HttpError(400, "Only pending or accepted requests can be modified.");
    }

    // ACTION 1: Pharmacist accepts the new incoming order
    if (action === "ACCEPT_ORDER") {
      await prisma.reservation.update({
        where: { id: req.params.reservationId },
        data: { status: "ACCEPTED" }
      });
      return res.json({ success: true, message: "Order accepted. Ready for pickup." });
    }

    // ACTION 2: Pharmacist rejects the order (Restores stock)
    if (action === "REJECT") {
      await prisma.$transaction(async (tx) => {
        await tx.reservation.update({
          where: { id: req.params.reservationId },
          data: { status: "REJECTED" }
        });

        for (const item of reservation.Items) {
          await tx.stockTransaction.create({
            data: {
              id: crypto.randomUUID(),
              batchId: item.batchId,
              type: "PURCHASE",
              quantity: item.quantity,
              remarks: `Restocked: Order #${reservation.id} Rejected`
            }
          });
        }
      });
      return res.json({ success: true, message: "Reservation rejected and stock restored." });
    }

    // ACTION 3: Pharmacist verifies customer token (Finalizes Order)
    if (action === "APPROVE") {
      await prisma.reservation.update({
        where: { id: req.params.reservationId },
        data: { status: "APPROVED" }
      });
      return res.json({ success: true, message: "Reservation approved and completed." });
    }

    throw new HttpError(400, "Invalid action provided.");
  })
);

// ==========================================
// PATCH: Pharmacist reviews a prescription
// ==========================================
router.patch(
  "/:pharmacyId/reservations/:reservationId/fulfill",
  authenticate,
  authorize("PHARMACIST", "OWNER"),
  asyncHandler(async (req, res) => {
    const { items, pharmacistNote } = req.body;

    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.reservationId },
    });

    if (!reservation) throw new HttpError(404, "Reservation not found");
    if (reservation.pharmacyId !== req.params.pharmacyId) {
      throw new HttpError(403, "This reservation does not belong to your pharmacy.");
    }
    if (reservation.status !== "AWAITING_REVIEW") {
      throw new HttpError(400, "Only prescription orders awaiting review can be fulfilled this way.");
    }

    const chosenItems = Array.isArray(items) ? items : [];

    if (chosenItems.length === 0) {
      const updated = await prisma.reservation.update({
        where: { id: req.params.reservationId },
        data: {
          status: "REJECTED",
          pharmacistNote: pharmacistNote ? String(pharmacistNote).trim() : "None of the prescribed items are available at this pharmacy.",
        },
      });
      return res.json({ success: true, message: "Order rejected — no items available.", data: updated });
    }

    const batchIds = chosenItems.map(item => item.batchId);
    const batchesWithStock = await prisma.medicineBatch.findMany({
      where: { id: { in: batchIds } },
      include: { StockTransaction: true },
    });

    for (const chosenItem of chosenItems) {
      const batch = batchesWithStock.find(b => b.id === chosenItem.batchId);
      if (!batch) {
        throw new HttpError(400, `Batch not found for one of the selected items.`);
      }

      const currentStock = batch.StockTransaction.reduce(
        (sum, tx) => sum + (tx.type === "PURCHASE" ? tx.quantity : -tx.quantity),
        0
      );
      const availableStock = Math.max(0, currentStock);

      if (Number(chosenItem.quantity) > availableStock) {
        throw new HttpError(
          400,
          `Only ${availableStock} unit(s) available for one of the selected items — you tried to add ${chosenItem.quantity}.`
        );
      }
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: req.params.reservationId },
      data: {
        status: "DRAFT_SENT",
        pharmacistNote: pharmacistNote ? String(pharmacistNote).trim() : null,
       Items: {
          create: chosenItems.map(item => ({
            batchId: item.batchId,
            medicineId: item.medicineId,
            quantity: Number(item.quantity),
            morningDose: Boolean(item.morningDose),
            morningTiming: item.morningDose ? (item.morningTiming || null) : null,
            afternoonDose: Boolean(item.afternoonDose),
            afternoonTiming: item.afternoonDose ? (item.afternoonTiming || null) : null,
            eveningDose: Boolean(item.eveningDose),
            eveningTiming: item.eveningDose ? (item.eveningTiming || null) : null,
            dosageNote: item.dosageNote ? String(item.dosageNote).trim() : null,
          })),
        },
      },
      include: { Items: { include: { Medicine: true } } },
    });

    res.json({ success: true, message: "Draft sent to customer for approval.", data: updatedReservation });
  })
);

// ==========================================
// PATCH: Customer accepts a pharmacist's draft
// ==========================================
router.patch(
  "/:reservationId/accept",
  authenticate,
  asyncHandler(async (req, res) => {
    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.reservationId },
      include: { Items: true },
    });

    if (!reservation) throw new HttpError(404, "Reservation not found");
    if (reservation.userId !== req.user.id) {
      throw new HttpError(403, "This reservation does not belong to you.");
    }
    if (reservation.status !== "DRAFT_SENT") {
      throw new HttpError(400, "Only a draft awaiting your approval can be accepted.");
    }

    const batchIds = reservation.Items.map(item => item.batchId);
    const batchesWithStock = await prisma.medicineBatch.findMany({
      where: { id: { in: batchIds } },
      include: { StockTransaction: true },
    });

    for (const item of reservation.Items) {
      const batch = batchesWithStock.find(b => b.id === item.batchId);
      if (!batch) {
        throw new HttpError(400, "One of the drafted items is no longer available. Please contact the pharmacy.");
      }
      const currentStock = batch.StockTransaction.reduce(
        (sum, tx) => sum + (tx.type === "PURCHASE" ? tx.quantity : -tx.quantity),
        0
      );
      const availableStock = Math.max(0, currentStock);
      if (item.quantity > availableStock) {
        throw new HttpError(
          400,
          `Only ${availableStock} unit(s) of one of the drafted items are available now — please contact the pharmacy to adjust before accepting.`
        );
      }
    }

    const updatedReservation = await prisma.$transaction(async (tx) => {
      const resv = await tx.reservation.update({
        where: { id: req.params.reservationId },
        data: { status: "PENDING" },
        include: { Items: true },
      });

      for (const item of reservation.Items) {
        await tx.stockTransaction.create({
          data: {
            id: crypto.randomUUID(),
            batchId: item.batchId,
            type: "RESERVATION",
            quantity: item.quantity,
            remarks: `Stock held for Order #${resv.id} (accepted draft)`,
          },
        });
      }

      return resv;
    });

    const generatedCode = `MF-${updatedReservation.id.split('-')[0].toUpperCase()}`;
    res.json({ success: true, message: "Draft accepted — your token is ready.", data: { ...updatedReservation, reservationCode: generatedCode } });
  })
);

// ==========================================
// PATCH: Customer rejects a pharmacist's draft
// ==========================================
router.patch(
  "/:reservationId/reject-draft",
  authenticate,
  asyncHandler(async (req, res) => {
    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.reservationId },
    });

    if (!reservation) throw new HttpError(404, "Reservation not found");
    if (reservation.userId !== req.user.id) {
      throw new HttpError(403, "This reservation does not belong to you.");
    }
    if (reservation.status !== "DRAFT_SENT") {
      throw new HttpError(400, "Only a draft awaiting your approval can be rejected.");
    }

    const updated = await prisma.reservation.update({
      where: { id: req.params.reservationId },
      data: { status: "CANCELLED" },
    });

    res.json({ success: true, message: "Draft declined.", data: updated });
  })
);

module.exports = router;