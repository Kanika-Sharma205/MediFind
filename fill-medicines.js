// One-time script: backfills genericName + dosageForm for medicines that
// were created with the "Pending Update" placeholder by the old bulk-upload
// code, using the Generic Name / Dosage Form columns from the updated Excel.
//
// Usage:
//   node backfill-medicine-info.js medicine_inventory_50_rows.xlsx
//
// Safe to run more than once — it only touches medicines whose current
// genericName or dosageForm is exactly "Pending Update".

const path = require("path");
const xlsx = require("xlsx");
const prisma = require("./src/lib/prisma");

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: node backfill-medicine-info.js <path-to-excel>");
    process.exit(1);
  }

  const workbook = xlsx.readFile(path.resolve(filePath));
  const sheetName = workbook.SheetNames[0];
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  let updated = 0;
  let skippedNoMatch = 0;
  let skippedAlreadySet = 0;

  for (const row of rows) {
    const clean = {};
    for (const key in row) clean[key.toLowerCase().trim()] = row[key];

    const brandName = String(clean["medicine name"] || clean["medicine"] || "").trim();
    const genericName = String(clean["generic name"] || clean["generic"] || "").trim();
    const dosageForm = String(clean["dosage form"] || clean["dosage"] || clean["form"] || "").trim();

    if (!brandName || (!genericName && !dosageForm)) continue;

    const medicine = await prisma.medicine.findFirst({
      where: { brandName: { equals: brandName, mode: "insensitive" } },
    });

    if (!medicine) {
      skippedNoMatch += 1;
      console.log(`No match in DB for "${brandName}" — skipped.`);
      continue;
    }

    const data = {};
    if (genericName && medicine.genericName === "Pending Update") data.genericName = genericName;
    if (dosageForm && medicine.dosageForm === "Pending Update") data.dosageForm = dosageForm;

    if (Object.keys(data).length === 0) {
      skippedAlreadySet += 1;
      continue;
    }

    await prisma.medicine.update({ where: { id: medicine.id }, data });
    updated += 1;
    console.log(`Updated "${brandName}" ->`, data);
  }

  console.log("\nDone.");
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (no matching medicine in DB): ${skippedNoMatch}`);
  console.log(`Skipped (already had real values, not "Pending Update"): ${skippedAlreadySet}`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});