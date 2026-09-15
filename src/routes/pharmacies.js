const express = require("express");
const crypto = require("crypto");
const prisma = require("../lib/prisma");
const multer = require("multer");
const xlsx = require("xlsx");
// Configure multer to hold the file in memory (max 5MB)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// ==========================================
// PATCH: Toggle Pharmacy Availability
// ==========================================
router.patch(
  "/:id/availability",
  authenticate,
  authorize("PHARMACIST", "OWNER", "ADMIN"),
  asyncHandler(async (req, res) => {
    const { isAvailable } = req.body;
    if (typeof isAvailable !== 'boolean') {
      throw new HttpError(400, "isAvailable must be a boolean");
    }
    
    // Ensure the user actually owns this pharmacy or is an admin
    const pharmacy = await prisma.pharmacy.findUnique({ where: { id: req.params.id } });
    if (!pharmacy) throw new HttpError(404, "Pharmacy not found");
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN' && pharmacy.ownerId !== req.user.id) {
      throw new HttpError(403, "You can only update your own pharmacy");
    }

    const updated = await prisma.pharmacy.update({
      where: { id: req.params.id },
      data: { isAvailable }
    });

    res.json({ success: true, isAvailable: updated.isAvailable });
  })
);

// ==========================================
// GET: List pharmacies (for pickers like the prescription-order flow,
// where a customer needs to choose a pharmacy without having searched
// for a specific medicine first)
// ==========================================
// Haversine distance in kilometers between two lat/lng points
function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ==========================================
// GET: List pharmacies. Optionally pass ?lat=&lng=&radiusKm= to get only
// nearby pharmacies, sorted closest-first, each with a distanceKm value.
// Without those params, behaves as before (full list, no distance).
// ==========================================
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const pharmacies = await prisma.pharmacy.findMany({
      where: { status: "APPROVED", isAvailable: true },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        pincode: true,
        phone: true,
        latitude: true,
        longitude: true,
      },
      orderBy: { name: "asc" },
    });

    const { lat, lng, radiusKm } = req.query;

    if (lat && lng) {
      const originLat = parseFloat(lat);
      const originLng = parseFloat(lng);
      const radius = radiusKm ? parseFloat(radiusKm) : 10; // default 10km

      const withDistance = pharmacies
        .filter((p) => p.latitude != null && p.longitude != null)
        .map((p) => ({
          ...p,
          distanceKm: Number(distanceKm(originLat, originLng, p.latitude, p.longitude).toFixed(2)),
        }))
        .filter((p) => p.distanceKm <= radius)
        .sort((a, b) => a.distanceKm - b.distanceKm);

      return res.json({ success: true, data: withDistance });
    }

    res.json({ success: true, data: pharmacies });
  })
);

router.get(
  "/:id/inventory",
  asyncHandler(async (req, res) => {
    const batches = await prisma.medicineBatch.findMany({
      where: { pharmacyId: req.params.id },
      include: {
        Medicine: { include: { Manufacturer: true } },
        StockTransaction: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: batches.map((batch) => {
        let calcStock = 0;
        if (batch.StockTransaction && Array.isArray(batch.StockTransaction)) {
          calcStock = batch.StockTransaction.reduce((sum, tx) => sum + (tx.type === 'PURCHASE' ? tx.quantity : -tx.quantity), 0);
        }
        if (calcStock === 0) calcStock = 50; // Demo fallback

        return {
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          expiryDate: batch.expiryDate,
          sellingPrice: Number(batch.sellingPrice),
          availableQuantity: Math.max(0, calcStock),
          medicine: batch.Medicine,
        };
      }),
    });
  })
);

router.post(
  "/:id/inventory",
  authenticate,
  authorize("PHARMACIST", "OWNER", "ADMIN"),
  asyncHandler(async (req, res) => {
    const { medicineId, batchNumber, expiryDate, purchasePrice, sellingPrice, quantity, remarks } = req.body;

    if (!medicineId || !batchNumber || !expiryDate || !purchasePrice || !sellingPrice || !quantity) {
      throw new HttpError(400, "Medicine, batch, expiry, prices, and quantity are required");
    }

    // Protect against duplicate batches with conflicting dates
    let existingBatch = await prisma.medicineBatch.findFirst({
      where: { pharmacyId: req.params.id, batchNumber: batchNumber, medicineId: medicineId }
    });

    if (existingBatch) {
      await prisma.stockTransaction.create({
        data: {
          id: crypto.randomUUID(),
          batchId: existingBatch.id,
          type: "PURCHASE",
          quantity: Number(quantity),
          remarks: remarks || "Added stock",
        }
      });
      return res.status(200).json({ success: true, message: "Stock added to existing batch" });
    }

    const batch = await prisma.medicineBatch.create({
      data: {
        id: crypto.randomUUID(),
        medicineId,
        pharmacyId: req.params.id,
        batchNumber,
        expiryDate: new Date(expiryDate),
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        StockTransaction: {
          create: {
            id: crypto.randomUUID(),
            type: "PURCHASE",
            quantity: Number(quantity),
            remarks: remarks || "Initial stock",
          },
        },
      }
    });

    res.status(201).json({ success: true, data: batch });
  })
);

// ==========================================
// GET: Pharmacy Analytics
// ==========================================
router.get(
  "/:id/analytics",
  authenticate,
  authorize("PHARMACIST", "OWNER", "ADMIN"),
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    // Default to last 3 months if not provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      start.setMonth(start.getMonth() - 3);
    }
    
    // Set hours to encompass full days
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 95) {
      throw new HttpError(400, "Date range cannot exceed 3 months.");
    }

    // Fetch Reservations
    const reservations = await prisma.reservation.findMany({
      where: {
        pharmacyId: req.params.id,
        status: { in: ["COMPLETED", "ACCEPTED", "APPROVED"] },
        updatedAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        User: { select: { name: true } },
        Items: {
          include: {
            Medicine: true
          }
        }
      }
    });

    // Fetch all batches to get selling prices
    const batches = await prisma.medicineBatch.findMany({
      where: { pharmacyId: req.params.id },
      select: { id: true, sellingPrice: true }
    });
    const batchPrices = {};
    batches.forEach(b => batchPrices[b.id] = Number(b.sellingPrice || 0));

    let totalRevenue = 0;
    const totalOrders = reservations.length;
    const dailyData = {}; 
    const topItemsMap = {}; 
    const categoryMap = {};
    const transactions = [];

    // Pre-populate dailyData with all dates in the range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyData[dateStr] = { revenue: 0, orders: 0, date: dateStr };
    }

    reservations.forEach(resv => {
      const dateStr = resv.updatedAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { revenue: 0, orders: 0, date: dateStr };
      }
      dailyData[dateStr].orders += 1;

      let orderRevenue = 0;
      resv.Items.forEach(item => {
        const price = batchPrices[item.batchId] || 0; 
        const lineTotal = price * item.quantity;
        orderRevenue += lineTotal;
        
        if (!topItemsMap[item.medicineId]) {
          topItemsMap[item.medicineId] = {
            id: item.medicineId,
            name: item.Medicine?.brandName || "Unknown",
            quantity: 0,
            revenue: 0
          };
        }
        topItemsMap[item.medicineId].quantity += item.quantity;
        topItemsMap[item.medicineId].revenue += lineTotal;

        transactions.push({
          date: dateStr,
          customerName: resv.User?.name || "Unknown",
          medicineName: item.Medicine?.brandName || "Unknown",
          quantity: item.quantity,
          price: price,
          total: lineTotal
        });
      });

      totalRevenue += orderRevenue;
      dailyData[dateStr].revenue += orderRevenue;
    });

    const dailyTrend = Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
    const topItems = Object.values(topItemsMap).sort((a, b) => b.quantity - a.quantity).slice(0, 10);
    const topRevenueItems = Object.values(topItemsMap).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
    
    // Sort transactions latest first
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        summary: { totalRevenue, totalOrders, days: diffDays },
        dailyTrend,
        topItems,
        topRevenueItems,
        transactions
      }
    });
  })
);

// ==========================================
// GET: Pharmacy Restricted Sales
// ==========================================
router.get(
  "/:id/restricted-sales",
  authenticate,
  authorize("PHARMACIST", "OWNER", "ADMIN", "SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    // Default to last 1 month if not provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      start.setMonth(start.getMonth() - 1);
    }
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Fetch Reservations that contain restricted items
    const reservations = await prisma.reservation.findMany({
      where: {
        pharmacyId: req.params.id,
        status: { in: ["COMPLETED", "ACCEPTED", "APPROVED"] },
        updatedAt: {
          gte: start,
          lte: end,
        },
        Items: {
          some: {
            Medicine: {
              isRestricted: true
            }
          }
        }
      },
      include: {
        User: { select: { name: true, phone: true, email: true } },
        Items: {
          include: {
            Medicine: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const restrictedSales = [];

    reservations.forEach(resv => {
      const dateStr = resv.updatedAt.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      
      resv.Items.forEach(item => {
        if (item.Medicine && item.Medicine.isRestricted) {
          restrictedSales.push({
            date: dateStr,
            customerName: resv.User?.name || "Unknown",
            customerPhone: resv.User?.phone || resv.User?.email || "N/A", // Fallback to email if no phone
            medicineName: item.Medicine.brandName,
            quantity: item.quantity
          });
        }
      });
    });

    res.json({
      success: true,
      data: restrictedSales
    });
  })
);

// POST: Bulk Upload Excel Inventory
// POST: Bulk Upload Excel Inventory
router.post(
  "/:id/inventory/bulk",
  authenticate,
  authorize("PHARMACIST", "OWNER", "ADMIN"),
  upload.single("file"), 
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new HttpError(400, "Please upload an Excel or CSV file");
    }

    // 1. Parse the Excel file
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0]; 
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (rows.length === 0) {
      throw new HttpError(400, "The uploaded file is empty.");
    }

    // 2. Fetch master data and fallback constraints
    const masterMedicines = await prisma.medicine.findMany();
    
    let fallbackManufacturer = await prisma.manufacturer.findFirst({
      where: { name: "Unknown" } 
    });

    if (!fallbackManufacturer) {
      fallbackManufacturer = await prisma.manufacturer.create({
        data: {
          id: crypto.randomUUID(),
          name: "Unknown"
        }
      });
    }
    
    let addedCount = 0;
    let errors = [];

    // 3. THE SINGLE, UNIFIED LOOP
    for (const [index, row] of rows.entries()) {
      const rowNum = index + 2; 
      
      try {
        const cleanRow = {};
        for (const key in row) {
          cleanRow[key.toLowerCase().trim()] = row[key];
        }

        const medName = cleanRow["medicine name"] || cleanRow["medicine"];
        const batchNumber = cleanRow["batch number"] || cleanRow["batch"];
        const rawQuantity = cleanRow["quantity"] || cleanRow["qty"];
        const rawPurchase = cleanRow["purchase price"] || 0; 
        const rawSelling = cleanRow["mrp"] || cleanRow["selling price"];
        const rawExpiry = cleanRow["expiry date"] || cleanRow["expiry"];
        const rawSalt = cleanRow["salt composition"] || cleanRow["salt"];
        const rawRestricted = cleanRow["restricted"] || cleanRow["is restricted"] || cleanRow["restricted status"];
        const isRestricted = ["true", "yes", "1", "y"].includes(String(rawRestricted || "").trim().toLowerCase());

        // 👻 IGNORE GHOST ROWS
        if (!medName && !batchNumber && !rawQuantity) continue; 

        // 🛡️ STRICT VALIDATION
        if (!medName || !batchNumber || !rawQuantity || !rawSelling || !rawExpiry || !rawSalt) {
          errors.push(`Row ${rowNum}: Missing mandatory field.`);
          continue;
        }

        let matchedMedicine = masterMedicines.find(m => 
          m.brandName.toLowerCase().trim() === String(medName).toLowerCase().trim()
        );

        // 🚀 DYNAMIC CREATION (Fully Loaded)
        if (!matchedMedicine) {
          matchedMedicine = await prisma.medicine.create({
            data: {
              id: crypto.randomUUID(),
              skuCode: "SKU-" + Math.floor(100000 + Math.random() * 900000),
              brandName: String(medName).trim(),
              genericName: "Pending Update",
              manufacturerId: fallbackManufacturer.id, 
              updatedAt: new Date(),                   
              saltComposition: String(rawSalt).trim(),
              dosageForm: "Pending Update",
              prescriptionRequired: isRestricted, // restricted medicines always require a prescription too
              isRestricted: isRestricted
            }
          });
          masterMedicines.push(matchedMedicine);
        }

        let formattedExpiry;
        if (typeof rawExpiry === 'number') {
          formattedExpiry = new Date(Math.round((rawExpiry - 25569) * 86400 * 1000));
        } else {
          formattedExpiry = new Date(rawExpiry);
        }

      let existingBatch = await prisma.medicineBatch.findFirst({
          where: { pharmacyId: req.params.id, batchNumber: String(batchNumber), medicineId: matchedMedicine.id },
          include: { StockTransaction: true } // 👈 NEW: Bring in the history so we can calculate current stock
        });
        if (existingBatch) {
          // 1. Calculate what the database currently thinks the stock is
          let currentStock = 0;
          for (const txn of existingBatch.StockTransaction) {
            // Assuming your types are PURCHASE/SALE/RESERVATION. Adjust if your enum is different!
            if (txn.type === "PURCHASE") currentStock += txn.quantity;
            else currentStock -= txn.quantity; 
          }

          // 2. See if the Excel file is different from the database
          const targetStock = Number(rawQuantity);
          const difference = targetStock - currentStock;

          // 3. Only create a transaction if the numbers don't match (Overwrite behavior)
          if (difference !== 0) {
            await prisma.stockTransaction.create({
              data: {
                id: crypto.randomUUID(),
                batchId: existingBatch.id,
                // If difference is positive, it's a purchase. If negative, it's an adjustment/sale.
                type: difference > 0 ? "PURCHASE" : "ADJUSTMENT", 
                // Math.abs() removes the minus sign so the database always gets a positive number
                quantity: Math.abs(difference), 
                remarks: "Excel Auto-Sync Adjustment"
              }
            });
          }
        } else {
           // ... (keep your existing 'else' block for creating a brand new batch here)
          await prisma.medicineBatch.create({
            data: {
              id: crypto.randomUUID(),
              medicineId: matchedMedicine.id,
              pharmacyId: req.params.id,
              batchNumber: String(batchNumber),
              expiryDate: formattedExpiry,
              purchasePrice: Number(rawPurchase),
              sellingPrice: Number(rawSelling),
              mrp: Number(rawSelling),
              StockTransaction: {
                create: {
                  id: crypto.randomUUID(),
                  type: "PURCHASE",
                  quantity: Number(rawQuantity),
                  remarks: "Bulk Excel Upload Initial Stock"
                }
              }
            }
          });
        }
        addedCount++;
      } catch (err) {
        console.error(`Database Error on Row ${rowNum}:`, err.message); 
        errors.push(`Row ${rowNum}: System error - ${err.message}`);
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully processed ${addedCount} items.`,
      errors: errors.length > 0 ? errors : undefined
    });
  })
);
module.exports = router;