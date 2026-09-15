const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const prisma = require("../lib/prisma");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate, authorize } = require("../middleware/auth");
const { getAvailableQuantity } = require("../utils/stock");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const fetchMedicines = async (query) => {
  return prisma.medicine.findMany({
    where: query
      ? {
          OR: [
            { brandName: { contains: query, mode: "insensitive" } },
            { genericName: { contains: query, mode: "insensitive" } },
            { skuCode: { contains: query, mode: "insensitive" } },
            { barcode: { contains: query, mode: "insensitive" } },
            { saltComposition: { contains: query, mode: "insensitive" } },
            { hsnCode: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      Manufacturer: true,
      MedicineBatch: {
        where: {
          Pharmacy: {
            isAvailable: true,
            status: "APPROVED"
          }
        },
        include: {
          Pharmacy: true,
          StockTransaction: true,
        },
      },
    },
    orderBy: [{ brandName: "asc" }, { genericName: "asc" }],
    take: 50,
  });
};

function distanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const serializeMedicine = (medicine, originLat = null, originLng = null) => {
  const batches = medicine.MedicineBatch || [];
  const prices = batches.map((batch) => Number(batch.sellingPrice));

  // Calculate real total stock across all batches
  const realTotalStock = batches.reduce((total, batch) => {
    const batchStock = (batch.StockTransaction || []).reduce((sum, tx) => 
      sum + (tx.type === 'PURCHASE' ? tx.quantity : -tx.quantity), 0);
    return total + Math.max(0, batchStock);
  }, 0);

  return {
    id: medicine.id,
    skuCode: medicine.skuCode,
    barcode: medicine.barcode,
    genericName: medicine.genericName,
    brandName: medicine.brandName,
    dosageForm: medicine.dosageForm,
    strength: medicine.strength,
    packSize: medicine.packSize,
    unit: medicine.unit,
    saltComposition: medicine.saltComposition,
    category: medicine.category,
    schedule: medicine.schedule,
    hsnCode: medicine.hsnCode,
    gstRate: medicine.gstRate === null || medicine.gstRate === undefined ? null : Number(medicine.gstRate),
    prescriptionRequired: medicine.prescriptionRequired,
    isRestricted: Boolean(medicine.isRestricted),
    manufacturer: medicine.Manufacturer,
    
    totalAvailable: realTotalStock, // 👈 Real calculated stock
    lowestPrice: prices.length ? Math.min(...prices) : null,
    
    pharmacies: batches.map((batch) => {
      let realStock = 0;
      if (batch.StockTransaction && Array.isArray(batch.StockTransaction)) {
          realStock = batch.StockTransaction.reduce((sum, tx) => sum + (tx.type === 'PURCHASE' ? tx.quantity : -tx.quantity), 0);
      }

      let dist = null;
      if (originLat != null && originLng != null && batch.Pharmacy?.latitude != null && batch.Pharmacy?.longitude != null) {
        dist = Number(distanceKm(originLat, originLng, batch.Pharmacy.latitude, batch.Pharmacy.longitude).toFixed(1));
      }

      return {
        // We MUST include these for your "Nearest First" UI sorting to work!
        pharmacyId: batch.Pharmacy ? batch.Pharmacy.id : null,
        pharmacyName: batch.Pharmacy ? batch.Pharmacy.name : "Unknown",
        city: batch.Pharmacy ? batch.Pharmacy.city : null,
        pincode: batch.Pharmacy ? batch.Pharmacy.pincode : null,
        
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        manufacturingDate: batch.manufacturingDate,
        mrp: batch.mrp === null || batch.mrp === undefined ? null : Number(batch.mrp),
        purchasePrice: Number(batch.purchasePrice),
        sellingPrice: Number(batch.sellingPrice),
        
        availableQuantity: Math.max(0, realStock),
        qty: Math.max(0, realStock),
        distance: dist
      };
    }),
  };
};
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = String(req.query.q || "").trim();
    const lat = req.query.lat ? parseFloat(req.query.lat) : null;
    const lng = req.query.lng ? parseFloat(req.query.lng) : null;
    const medicines = await fetchMedicines(query);

    // Optionally sort the pharmacies in the results by distance
    const serialized = medicines.map(m => serializeMedicine(m, lat, lng));
    serialized.forEach(m => {
       if (m.pharmacies) {
         // If location is provided, strictly filter to 10km radius
         if (lat != null && lng != null) {
           m.pharmacies = m.pharmacies.filter(p => p.distance != null && p.distance <= 10);
         }
         
         m.pharmacies.sort((a, b) => {
           if (a.distance == null) return 1;
           if (b.distance == null) return -1;
           return a.distance - b.distance;
         });
       }
    });

    res.json({
      success: true,
      data: serialized,
    });
  })
);

// --- RESTRICTED MEDICINES ADMIN ROUTES ---
router.get("/restricted", authenticate, authorize("ADMIN", "SUPER_ADMIN"), asyncHandler(async (req, res) => {
  const restrictedMeds = await prisma.medicine.findMany({
    where: { isRestricted: true },
    select: { id: true, skuCode: true, brandName: true, genericName: true, category: true, isRestricted: true }
  });
  res.json({ success: true, data: restrictedMeds });
}));

router.patch("/:id/restrict", authenticate, authorize("ADMIN", "SUPER_ADMIN"), asyncHandler(async (req, res) => {
  const { isRestricted } = req.body;
  if (typeof isRestricted !== 'boolean') {
    throw new HttpError(400, "isRestricted must be a boolean");
  }
  const updated = await prisma.medicine.update({
    where: { id: req.params.id },
    data: { isRestricted },
    select: { id: true, isRestricted: true }
  });
  res.json({ success: true, data: updated });
}));

router.get("/search", asyncHandler(async (req, res) => {
  const { query } = req.query;

  // 1. Perform the search
  const medicines = await prisma.medicine.findMany({
    where: {
      OR: [
        { brandName: { contains: query, mode: 'insensitive' } },
        { genericName: { contains: query, mode: 'insensitive' } },
        { saltComposition: { contains: query, mode: 'insensitive' } }
      ]
    },
    include: {
      MedicineBatch: {
        where: {
          Pharmacy: {
            isAvailable: true,
            status: "APPROVED"
          }
        },
        include: { StockTransaction: true }
      }
    }
  });

  // 2. Add "Availability & Price" logic
  const results = medicines.map(med => {
    const totalStock = med.MedicineBatch.reduce((sum, batch) => {
      const batchStock = batch.StockTransaction.reduce((s, tx) => 
        s + (tx.type === 'PURCHASE' ? tx.quantity : -tx.quantity), 0);
      return sum + Math.max(0, batchStock);
    }, 0);

    const minPrice = med.MedicineBatch.length > 0 
      ? Math.min(...med.MedicineBatch.map(b => Number(b.sellingPrice))) 
      : 0;

    return {
      ...med,
      availableQuantity: totalStock,
      minPrice: minPrice
    };
  });

  // 3. Sort by: 1. Availability (In-stock first), 2. Price (Low to high)
  results.sort((a, b) => (b.availableQuantity > 0 ? 1 : 0) - (a.availableQuantity > 0 ? 1 : 0) || a.minPrice - b.minPrice);

  // 4. Send the response ONLY ONCE
  res.json({ success: true, data: results });
}));
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(async (req, res) => {
    const {
      skuCode,
      barcode,
      genericName,
      brandName,
      dosageForm,
      strength,
      packSize,
      unit,
      saltComposition,
      category,
      schedule,
      hsnCode,
      gstRate,
      prescriptionRequired = false,
      manufacturerName,
      manufacturerCode,
    } = req.body;

    if (!skuCode || !genericName || !brandName || !manufacturerName) {
      throw new HttpError(400, "SKU, generic name, brand name, and manufacturer name are required");
    }

    const medicine = await prisma.medicine.create({
      data: {
        skuCode,
        barcode,
        genericName,
        brandName,
        dosageForm,
        strength,
        packSize,
        unit,
        saltComposition,
        category,
        schedule,
        hsnCode,
        gstRate,
        prescriptionRequired: Boolean(prescriptionRequired),
        Manufacturer: {
          connectOrCreate: {
            where: { code: manufacturerCode || manufacturerName.toUpperCase().replace(/\s+/g, "_") },
            create: {
              name: manufacturerName,
              code: manufacturerCode || manufacturerName.toUpperCase().replace(/\s+/g, "_"),
            },
          },
        },
      },
      include: { Manufacturer: true },
    });

    res.status(201).json({ success: true, data: medicine });
  })
);

router.post(
  "/import",
  authenticate,
  authorize("ADMIN", "PHARMACY_OWNER"),
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new HttpError(400, "An Excel file is required");
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new HttpError(400, "The uploaded workbook is empty");
    }

    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
    const report = {
      inserted: 0,
      updated: 0,
      rejected: 0,
      errors: [],
    };

    const toManufacturerCode = (name) =>
      String(name || "")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_")
        .replace(/^_|_$/g, "");

    const parseDate = (value) => {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    for (const [index, row] of rows.entries()) {
      const skuCode = String(row.skuCode || row.sku || row["SKU Code"] || "").trim();
      const genericName = String(row.genericName || row["Generic Name"] || "").trim();
      const brandName = String(row.brandName || row["Brand Name"] || "").trim();
      const manufacturerName = String(row.manufacturerName || row["Manufacturer Name"] || "").trim();
      const pharmacyName = String(row.pharmacyName || row["Pharmacy Name"] || "").trim();
      const batchNumber = String(row.batchNumber || row["Batch Number"] || "").trim();
      const expiryDate = parseDate(row.expiryDate || row["Expiry Date"] || "");
      const purchasePrice = Number(row.purchasePrice || row["Purchase Price"] || 0);
      const sellingPrice = Number(row.sellingPrice || row["Selling Price"] || 0);
      const quantity = Number(row.quantity || row["Quantity"] || 0);

      if (!skuCode || !genericName || !brandName || !manufacturerName || !pharmacyName || !batchNumber || !expiryDate || !Number.isFinite(purchasePrice) || !Number.isFinite(sellingPrice) || !Number.isInteger(quantity) || quantity < 1) {
        report.rejected += 1;
        report.errors.push({ row: index + 2, message: "Missing or invalid required fields" });
        continue;
      }

      try {
        await prisma.$transaction(async (tx) => {
          const manufacturer = await tx.manufacturer.upsert({
            where: { code: toManufacturerCode(manufacturerName) },
            update: { name: manufacturerName },
            create: {
              name: manufacturerName,
              code: toManufacturerCode(manufacturerName),
            },
          });

          const medicine = await tx.medicine.upsert({
            where: { skuCode },
            update: {
              genericName,
              brandName,
              manufacturerId: manufacturer.id,
            },
            create: {
              skuCode,
              genericName,
              brandName,
              manufacturerId: manufacturer.id,
            },
          });

          const pharmacy = await tx.pharmacy.findFirst({
            where: {
              name: {
                equals: pharmacyName,
                mode: "insensitive",
              },
            },
          });

          if (!pharmacy) {
            throw new Error(`Pharmacy not found: ${pharmacyName}`);
          }

          const existingBatch = await tx.medicineBatch.findFirst({
            where: {
              medicineId: medicine.id,
              pharmacyId: pharmacy.id,
              batchNumber,
            },
          });

          if (existingBatch) {
            await tx.medicineBatch.update({
              where: { id: existingBatch.id },
              data: {
                expiryDate,
                purchasePrice,
                sellingPrice,
                mrp: Number(row.mrp || row["MRP"] || 0) || null,
                ptr: Number(row.ptr || row["PTR"] || 0) || null,
                marginPercent: Number(row.marginPercent || row["Margin Percent"] || 0) || null,
                packQuantity: Number(row.packQuantity || row["Pack Quantity"] || 0) || null,
                looseQuantity: Number(row.looseQuantity || row["Loose Quantity"] || 0) || null,
                freeQuantity: Number(row.freeQuantity || row["Free Quantity"] || 0) || null,
                rackNumber: String(row.rackNumber || row["Rack Number"] || "").trim() || null,
                shelfNumber: String(row.shelfNumber || row["Shelf Number"] || "").trim() || null,
                supplierName: String(row.supplierName || row["Supplier Name"] || "").trim() || null,
                supplierGstin: String(row.supplierGstin || row["Supplier GSTIN"] || "").trim() || null,
                purchaseInvoiceNo: String(row.purchaseInvoiceNo || row["Purchase Invoice No"] || "").trim() || null,
                purchaseInvoiceDate: parseDate(row.purchaseInvoiceDate || row["Purchase Invoice Date"] || "") || null,
              },
            });
            await tx.stockTransaction.create({
              data: {
                batchId: existingBatch.id,
                type: "PURCHASE",
                quantity,
                remarks: "Imported from Excel",
              },
            });
            report.updated += 1;
            return;
          }

          await tx.medicineBatch.create({
            data: {
              medicineId: medicine.id,
              pharmacyId: pharmacy.id,
              batchNumber,
              expiryDate,
              purchasePrice,
              sellingPrice,
              mrp: Number(row.mrp || row["MRP"] || 0) || null,
              ptr: Number(row.ptr || row["PTR"] || 0) || null,
              marginPercent: Number(row.marginPercent || row["Margin Percent"] || 0) || null,
              packQuantity: Number(row.packQuantity || row["Pack Quantity"] || 0) || null,
              looseQuantity: Number(row.looseQuantity || row["Loose Quantity"] || 0) || null,
              freeQuantity: Number(row.freeQuantity || row["Free Quantity"] || 0) || null,
              rackNumber: String(row.rackNumber || row["Rack Number"] || "").trim() || null,
              shelfNumber: String(row.shelfNumber || row["Shelf Number"] || "").trim() || null,
              supplierName: String(row.supplierName || row["Supplier Name"] || "").trim() || null,
              supplierGstin: String(row.supplierGstin || row["Supplier GSTIN"] || "").trim() || null,
              purchaseInvoiceNo: String(row.purchaseInvoiceNo || row["Purchase Invoice No"] || "").trim() || null,
              purchaseInvoiceDate: parseDate(row.purchaseInvoiceDate || row["Purchase Invoice Date"] || "") || null,
              transactions: {
                create: {
                  type: "PURCHASE",
                  quantity,
                  remarks: "Imported from Excel",
                },
              },
            },
          });

          report.inserted += 1;
        });
      } catch (error) {
        report.rejected += 1;
        report.errors.push({ row: index + 2, message: error.message || "Import failed" });
      }
    }

    res.json({ success: true, data: report });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const medicine = await prisma.medicine.findUnique({
      where: { id: req.params.id },
      include: {
        manufacturer: true,
        batches: {
          include: {
            pharmacy: true,
            transactions: true,
          },
        },
      },
    });

    if (!medicine) {
      return res.status(404).json({ success: false, message: "Medicine not found" });
    }

    res.json({
      success: true,
      data: serializeMedicine(medicine),
    });
  })
);
router.patch(
  "/:id",
  authenticate,
  authorize("PHARMACIST", "OWNER", "ADMIN"),
  asyncHandler(async (req, res) => {
    const { genericName, dosageForm, prescriptionRequired } = req.body;

    const updatedMedicine = await prisma.medicine.update({
      where: { id: req.params.id },
      data: {
        ...(genericName && { genericName: String(genericName).trim() }),
        ...(dosageForm && { dosageForm: String(dosageForm).trim() }),
        ...(prescriptionRequired !== undefined && { prescriptionRequired: Boolean(prescriptionRequired) })
      }
    });

    res.json({ success: true, data: updatedMedicine });
  })
);
module.exports = router;