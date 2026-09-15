// ─── Default reservation cap (admin can override globally) ───────────────────
let DEFAULT_MAX_RESERVATION = 500;
// In data.js or at top of app.js

// ─── Test users (25 accounts for testing phase) ──────────────────────────────
const TEST_USERS = [
  { id: "U001", name: "Aarav Sharma",    email: "aarav.sharma@test.medifind",    role: "customer",   password: "Test@001" },
  { id: "U002", name: "Priya Nair",      email: "priya.nair@test.medifind",      role: "customer",   password: "Test@002" },
  { id: "U003", name: "Rohan Gupta",     email: "rohan.gupta@test.medifind",     role: "customer",   password: "Test@003" },
  { id: "U004", name: "Sneha Iyer",      email: "sneha.iyer@test.medifind",      role: "customer",   password: "Test@004" },
  { id: "U005", name: "Karan Mehta",     email: "karan.mehta@test.medifind",     role: "customer",   password: "Test@005" },
  { id: "U006", name: "Meera Joshi",     email: "meera.joshi@test.medifind",     role: "customer",   password: "Test@006" },
  { id: "U007", name: "Vikram Rao",      email: "vikram.rao@test.medifind",      role: "customer",   password: "Test@007" },
  { id: "U008", name: "Ananya Das",      email: "ananya.das@test.medifind",      role: "customer",   password: "Test@008" },
  { id: "U009", name: "Ishaan Kapoor",   email: "ishaan.kapoor@test.medifind",   role: "customer",   password: "Test@009" },
  { id: "U010", name: "Divya Pillai",    email: "divya.pillai@test.medifind",    role: "customer",   password: "Test@010" },
  { id: "U011", name: "Arjun Singh",     email: "arjun.singh@test.medifind",     role: "customer",   password: "Test@011" },
  { id: "U012", name: "Kavya Reddy",     email: "kavya.reddy@test.medifind",     role: "customer",   password: "Test@012" },
  { id: "U013", name: "Nikhil Verma",    email: "nikhil.verma@test.medifind",    role: "customer",   password: "Test@013" },
  { id: "U014", name: "Pooja Patel",     email: "pooja.patel@test.medifind",     role: "customer",   password: "Test@014" },
  { id: "U015", name: "Rahul Tiwari",    email: "rahul.tiwari@test.medifind",    role: "customer",   password: "Test@015" },
  { id: "U016", name: "Sanya Khanna",    email: "sanya.khanna@test.medifind",    role: "customer",   password: "Test@016" },
  { id: "U017", name: "Dev Malhotra",    email: "dev.malhotra@test.medifind",    role: "customer",   password: "Test@017" },
  { id: "U018", name: "Tanya Bose",      email: "tanya.bose@test.medifind",      role: "customer",   password: "Test@018" },
  { id: "U019", name: "Harsh Agarwal",   email: "harsh.agarwal@test.medifind",   role: "customer",   password: "Test@019" },
  { id: "U020", name: "Riya Saxena",     email: "riya.saxena@test.medifind",     role: "customer",   password: "Test@020" },
  { id: "U021", name: "Dr. A. Kumar",    email: "pharmacist.wellness@test.medifind", role: "pharmacist", password: "Pharm@001" },
  { id: "U022", name: "Dr. S. Reddy",    email: "pharmacist.citycare@test.medifind", role: "pharmacist", password: "Pharm@002" },
  { id: "U023", name: "Dr. N. Singh",    email: "pharmacist.greenleaf@test.medifind",role: "pharmacist", password: "Pharm@003" },
  { id: "U024", name: "J. Verma",        email: "admin@test.medifind",           role: "admin",      password: "Admin@001" },
  { id: "U025", name: "R. Chandra",      email: "admin2@test.medifind",          role: "admin",      password: "Admin@002" },
];

// ─── Pharmacies (12 registered) ─────────────────────────────────────────────
const PHARMACIES = [
  { id: "p1",  name: "Wellness Plus Pharmacy",  distance: 0.6 },
  { id: "p2",  name: "CityCare Chemists",        distance: 1.1 },
  { id: "p3",  name: "GreenLeaf Medicos",        distance: 1.4 },
  { id: "p4",  name: "MedPoint 24x7",            distance: 2.0 },
  { id: "p5",  name: "Apollo Health Store",      distance: 2.3 },
  { id: "p6",  name: "Sunrise Pharmacy",         distance: 2.7 },
  { id: "p7",  name: "HealthFirst Chemists",     distance: 3.1 },
  { id: "p8",  name: "Quick Meds 24x7",          distance: 3.5 },
  { id: "p9",  name: "Jana Aushadhi Kendra",     distance: 0.9 },
  { id: "p10", name: "Life Care Medical",        distance: 1.8 },
  { id: "p11", name: "Shree Balaji Medicals",   distance: 2.5 },
  { id: "p12", name: "City Medical Hall",        distance: 3.8 },
];

// ─── Medicines DB ────────────────────────────────────────────────────────────
// 35 unique salts + alternatives for common ones
const MEDICINES_DB = {
  // ── Fever / Pain ──────────────────────────────────────────────────────────
  "paracetamol": {
    name: "Paracetamol 500mg", generic: "Paracetamol",
    brands: ["Calpol", "Crocin", "Dolo 650"],
    type: "unique",
    results: [
      { pharmacy: "Wellness Plus Pharmacy", distance: 0.6, price: 28,  qty: 18, updated: "4 min ago" },
      { pharmacy: "CityCare Chemists",       distance: 1.1, price: 25,  qty: 6,  updated: "11 min ago" },
      { pharmacy: "GreenLeaf Medicos",       distance: 1.4, price: 30,  qty: 0,  updated: "2 min ago" },
      { pharmacy: "Jana Aushadhi Kendra",    distance: 0.9, price: 22,  qty: 9,  updated: "8 min ago" },
    ]
  },
  "ibuprofen": {
    name: "Ibuprofen 400mg", generic: "Ibuprofen",
    brands: ["Brufen", "Combiflam"],
    type: "unique",
    results: [
      { pharmacy: "CityCare Chemists",       distance: 1.1, price: 32,  qty: 8,  updated: "6 min ago" },
      { pharmacy: "MedPoint 24x7",           distance: 2.0, price: 30,  qty: 4,  updated: "20 min ago" },
      { pharmacy: "Apollo Health Store",     distance: 2.3, price: 35,  qty: 0,  updated: "35 min ago" },
    ]
  },
  "diclofenac": {
    name: "Diclofenac 50mg", generic: "Diclofenac Sodium",
    brands: ["Voveran", "Voltaren"],
    type: "unique",
    results: [
      { pharmacy: "GreenLeaf Medicos",       distance: 1.4, price: 40,  qty: 5,  updated: "9 min ago" },
      { pharmacy: "Wellness Plus Pharmacy",  distance: 0.6, price: 38,  qty: 2,  updated: "15 min ago" },
    ]
  },
  "nimesulide": {
    name: "Nimesulide 100mg", generic: "Nimesulide",
    brands: ["Nimulid", "Nice"],
    type: "unique",
    results: [
      { pharmacy: "Quick Meds 24x7",         distance: 3.5, price: 28,  qty: 7,  updated: "5 min ago" },
      { pharmacy: "Life Care Medical",       distance: 1.8, price: 25,  qty: 0,  updated: "30 min ago" },
    ]
  },

  // ── Antibiotics ──────────────────────────────────────────────────────────
  "azithromycin": {
    name: "Azithromycin 500mg", generic: "Azithromycin",
    brands: ["Azithral", "Zithromax", "Azee"],
    type: "unique", requiresRx: true,
    maxReservation: 2,
    results: [
      { pharmacy: "CityCare Chemists",       distance: 1.1, price: 112, qty: 4,  updated: "9 min ago" },
      { pharmacy: "Wellness Plus Pharmacy",  distance: 0.6, price: 118, qty: 0,  updated: "15 min ago" },
      { pharmacy: "Apollo Health Store",     distance: 2.3, price: 105, qty: 3,  updated: "3 min ago" },
    ]
  },
  "amoxicillin": {
    name: "Amoxicillin 500mg", generic: "Amoxicillin",
    brands: ["Mox", "Novamox", "Amoxil"],
    type: "unique", requiresRx: true,
    results: [
      { pharmacy: "GreenLeaf Medicos",       distance: 1.4, price: 65,  qty: 3,  updated: "7 min ago" },
      { pharmacy: "HealthFirst Chemists",    distance: 3.1, price: 60,  qty: 6,  updated: "12 min ago" },
    ]
  },
  "doxycycline": {
    name: "Doxycycline 100mg", generic: "Doxycycline",
    brands: ["Doxy-1", "Biodoxi"],
    type: "unique", requiresRx: true,
    results: [
      { pharmacy: "Sunrise Pharmacy",        distance: 2.7, price: 55,  qty: 5,  updated: "11 min ago" },
      { pharmacy: "Jana Aushadhi Kendra",    distance: 0.9, price: 45,  qty: 0,  updated: "40 min ago" },
    ]
  },
  "ciprofloxacin": {
    name: "Ciprofloxacin 500mg", generic: "Ciprofloxacin",
    brands: ["Ciplox", "Cifran"],
    type: "unique", requiresRx: true,
    results: [
      { pharmacy: "MedPoint 24x7",           distance: 2.0, price: 72,  qty: 4,  updated: "18 min ago" },
      { pharmacy: "City Medical Hall",       distance: 3.8, price: 68,  qty: 2,  updated: "25 min ago" },
    ]
  },
  "metronidazole": {
    name: "Metronidazole 400mg", generic: "Metronidazole",
    brands: ["Flagyl", "Metrogyl"],
    type: "unique",
    results: [
      { pharmacy: "Wellness Plus Pharmacy",  distance: 0.6, price: 20,  qty: 10, updated: "3 min ago" },
      { pharmacy: "CityCare Chemists",       distance: 1.1, price: 18,  qty: 5,  updated: "14 min ago" },
    ]
  },

  // ── Diabetes ─────────────────────────────────────────────────────────────
  "metformin": {
    name: "Metformin 500mg", generic: "Metformin HCl",
    brands: ["Glycomet", "Glucophage", "Obimet"],
    type: "unique",
    results: [
      { pharmacy: "Wellness Plus Pharmacy",  distance: 0.6, price: 42,  qty: 12, updated: "4 min ago" },
      { pharmacy: "CityCare Chemists",       distance: 1.1, price: 38,  qty: 6,  updated: "11 min ago" },
      { pharmacy: "Jana Aushadhi Kendra",    distance: 0.9, price: 30,  qty: 8,  updated: "7 min ago" },
    ]
  },
  "glimepiride": {
    name: "Glimepiride 2mg", generic: "Glimepiride",
    brands: ["Amaryl", "Glimit"],
    type: "unique", requiresRx: true,
    results: [
      { pharmacy: "Apollo Health Store",     distance: 2.3, price: 68,  qty: 4,  updated: "20 min ago" },
      { pharmacy: "Life Care Medical",       distance: 1.8, price: 62,  qty: 0,  updated: "45 min ago" },
    ]
  },
  "insulin": {
    name: "Insulin Glargine 100IU", generic: "Insulin Glargine",
    brands: ["Lantus", "Basalog"],
    type: "unique", requiresRx: true,
    maxReservation: 1,
    results: [
      { pharmacy: "GreenLeaf Medicos",       distance: 1.4, price: 689, qty: 2,  updated: "6 min ago" },
      { pharmacy: "MedPoint 24x7",           distance: 2.0, price: 705, qty: 1,  updated: "21 min ago" },
    ]
  },

  // ── Blood Pressure / Cardiac ──────────────────────────────────────────────
  "amlodipine": {
    name: "Amlodipine 5mg", generic: "Amlodipine",
    brands: ["Amlip", "Stamlo", "Norvasc"],
    type: "unique", requiresRx: true,
    results: [
      { pharmacy: "Shree Balaji Medicals",   distance: 2.5, price: 38,  qty: 7,  updated: "10 min ago" },
      { pharmacy: "HealthFirst Chemists",    distance: 3.1, price: 35,  qty: 4,  updated: "22 min ago" },
    ]
  },
  "atenolol": {
    name: "Atenolol 50mg", generic: "Atenolol",
    brands: ["Aten", "Tenormin"],
    type: "unique", requiresRx: true,
    results: [
      { pharmacy: "Sunrise Pharmacy",        distance: 2.7, price: 30,  qty: 5,  updated: "8 min ago" },
      { pharmacy: "Quick Meds 24x7",         distance: 3.5, price: 28,  qty: 3,  updated: "19 min ago" },
    ]
  },
  "telmisartan": {
    name: "Telmisartan 40mg", generic: "Telmisartan",
    brands: ["Telma", "Telmikind"],
    type: "unique", requiresRx: true,
    results: [
      { pharmacy: "MedPoint 24x7",           distance: 2.0, price: 55,  qty: 4,  updated: "15 min ago" },
      { pharmacy: "City Medical Hall",       distance: 3.8, price: 50,  qty: 2,  updated: "35 min ago" },
    ]
  },

  // ── Allergy / Respiratory ─────────────────────────────────────────────────
  "cetirizine": {
    name: "Cetirizine 10mg", generic: "Cetirizine HCl",
    brands: ["Zyrtec", "Alerid", "CTZ"],
    type: "unique",
    results: [
      { pharmacy: "Wellness Plus Pharmacy",  distance: 0.6, price: 18,  qty: 15, updated: "5 min ago" },
      { pharmacy: "Jana Aushadhi Kendra",    distance: 0.9, price: 12,  qty: 10, updated: "10 min ago" },
      { pharmacy: "GreenLeaf Medicos",       distance: 1.4, price: 20,  qty: 6,  updated: "12 min ago" },
    ]
  },
  "loratadine": {
    name: "Loratadine 10mg", generic: "Loratadine",
    brands: ["Loratadine", "Alavert"],
    type: "alternative",
    alternativeFor: "cetirizine",
    results: [
      { pharmacy: "HealthFirst Chemists",    distance: 3.1, price: 22,  qty: 5,  updated: "14 min ago" },
    ]
  },
  "salbutamol": {
    name: "Salbutamol Inhaler 100mcg", generic: "Salbutamol",
    brands: ["Asthalin", "Ventolin"],
    type: "unique", requiresRx: true,
    maxReservation: 1,
    results: [
      { pharmacy: "CityCare Chemists",       distance: 1.1, price: 145, qty: 2,  updated: "9 min ago" },
      { pharmacy: "Apollo Health Store",     distance: 2.3, price: 138, qty: 1,  updated: "25 min ago" },
    ]
  },
  "montelukast": {
    name: "Montelukast 10mg", generic: "Montelukast",
    brands: ["Montair", "Singulair"],
    type: "unique", requiresRx: true,
    results: [
      { pharmacy: "Shree Balaji Medicals",   distance: 2.5, price: 88,  qty: 4,  updated: "11 min ago" },
    ]
  },

  // ── Gastric / Digestion ───────────────────────────────────────────────────
  "omeprazole": {
    name: "Omeprazole 20mg", generic: "Omeprazole",
    brands: ["Omez", "Prilosec", "Ocid"],
    type: "unique",
    results: [
      { pharmacy: "Wellness Plus Pharmacy",  distance: 0.6, price: 35,  qty: 10, updated: "4 min ago" },
      { pharmacy: "Life Care Medical",       distance: 1.8, price: 30,  qty: 5,  updated: "18 min ago" },
    ]
  },
  "pantoprazole": {
    name: "Pantoprazole 40mg", generic: "Pantoprazole",
    brands: ["Pan-D", "Pantodac", "Pantop"],
    type: "alternative",
    alternativeFor: "omeprazole",
    results: [
      { pharmacy: "Jana Aushadhi Kendra",    distance: 0.9, price: 28,  qty: 7,  updated: "6 min ago" },
      { pharmacy: "GreenLeaf Medicos",       distance: 1.4, price: 32,  qty: 3,  updated: "20 min ago" },
    ]
  },
  "domperidone": {
    name: "Domperidone 10mg", generic: "Domperidone",
    brands: ["Domstal", "Motilium"],
    type: "unique",
    results: [
      { pharmacy: "CityCare Chemists",       distance: 1.1, price: 25,  qty: 8,  updated: "7 min ago" },
    ]
  },
  "ors": {
    name: "ORS Sachets", generic: "Oral Rehydration Salts",
    brands: ["Electral", "Pedialyte"],
    type: "unique",
    results: [
      { pharmacy: "Wellness Plus Pharmacy",  distance: 0.6, price: 12,  qty: 20, updated: "3 min ago" },
      { pharmacy: "Jana Aushadhi Kendra",    distance: 0.9, price: 8,   qty: 15, updated: "5 min ago" },
      { pharmacy: "Quick Meds 24x7",         distance: 3.5, price: 10,  qty: 8,  updated: "15 min ago" },
    ]
  },

  // ── Vitamins / Supplements ───────────────────────────────────────────────
  "vitamind3": {
    name: "Vitamin D3 60000 IU", generic: "Cholecalciferol",
    brands: ["Calcirol", "D-Rise", "Uprise-D3"],
    type: "unique",
    results: [
      { pharmacy: "Wellness Plus Pharmacy",  distance: 0.6, price: 95,  qty: 3,  updated: "5 min ago" },
      { pharmacy: "Apollo Health Store",     distance: 2.3, price: 90,  qty: 2,  updated: "28 min ago" },
    ]
  },
  "vitaminb12": {
    name: "Vitamin B12 500mcg", generic: "Methylcobalamin",
    brands: ["Mecobalamin", "Cobadex", "Methycobal"],
    type: "unique",
    results: [
      { pharmacy: "GreenLeaf Medicos",       distance: 1.4, price: 55,  qty: 6,  updated: "10 min ago" },
      { pharmacy: "Life Care Medical",       distance: 1.8, price: 50,  qty: 4,  updated: "22 min ago" },
    ]
  },
  "calcium": {
    name: "Calcium + Vitamin D3", generic: "Calcium Carbonate",
    brands: ["Shelcal", "Calcimax", "Ostocalcium"],
    type: "unique",
    results: [
      { pharmacy: "Sunrise Pharmacy",        distance: 2.7, price: 72,  qty: 5,  updated: "12 min ago" },
      { pharmacy: "Shree Balaji Medicals",   distance: 2.5, price: 68,  qty: 3,  updated: "20 min ago" },
    ]
  },
  "zinc": {
    name: "Zinc 50mg", generic: "Zinc Sulfate",
    brands: ["Zincovit", "Zinconia"],
    type: "unique",
    results: [
      { pharmacy: "Jana Aushadhi Kendra",    distance: 0.9, price: 22,  qty: 10, updated: "4 min ago" },
    ]
  },

  // ── Skin / Topical ────────────────────────────────────────────────────────
  "clotrimazole": {
    name: "Clotrimazole 1% Cream", generic: "Clotrimazole",
    brands: ["Candid", "Lotrimin", "Canesten"],
    type: "unique",
    results: [
      { pharmacy: "Wellness Plus Pharmacy",  distance: 0.6, price: 42,  qty: 5,  updated: "6 min ago" },
      { pharmacy: "MedPoint 24x7",           distance: 2.0, price: 38,  qty: 3,  updated: "25 min ago" },
    ]
  },
  "hydrocortisone": {
    name: "Hydrocortisone 1% Cream", generic: "Hydrocortisone",
    brands: ["Locoid", "Hytone"],
    type: "alternative",
    alternativeFor: "clotrimazole",
    results: [
      { pharmacy: "HealthFirst Chemists",    distance: 3.1, price: 48,  qty: 3,  updated: "18 min ago" },
    ]
  },

  // ── Thyroid ───────────────────────────────────────────────────────────────
  "levothyroxine": {
    name: "Levothyroxine 50mcg", generic: "Levothyroxine Sodium",
    brands: ["Thyronorm", "Eltroxin"],
    type: "unique", requiresRx: true,
    maxReservation: 1,
    results: [
      { pharmacy: "CityCare Chemists",       distance: 1.1, price: 35,  qty: 6,  updated: "8 min ago" },
      { pharmacy: "Shree Balaji Medicals",   distance: 2.5, price: 32,  qty: 3,  updated: "30 min ago" },
    ]
  },

  // ── Cholesterol ───────────────────────────────────────────────────────────
  "atorvastatin": {
    name: "Atorvastatin 10mg", generic: "Atorvastatin",
    brands: ["Lipitor", "Atorva", "Storvas"],
    type: "unique", requiresRx: true,
    results: [
      { pharmacy: "Apollo Health Store",     distance: 2.3, price: 58,  qty: 4,  updated: "14 min ago" },
      { pharmacy: "City Medical Hall",       distance: 3.8, price: 52,  qty: 2,  updated: "40 min ago" },
    ]
  },

  // ── Cough / Cold ─────────────────────────────────────────────────────────
  "dextromethorphan": {
    name: "Dextromethorphan 15mg", generic: "Dextromethorphan HBr",
    brands: ["Benylin", "Recofast", "Dextro"],
    type: "unique",
    results: [
      { pharmacy: "Quick Meds 24x7",         distance: 3.5, price: 45,  qty: 5,  updated: "9 min ago" },
      { pharmacy: "Life Care Medical",       distance: 1.8, price: 40,  qty: 3,  updated: "22 min ago" },
    ]
  },
  "diphenhydramine": {
    name: "Diphenhydramine 25mg", generic: "Diphenhydramine HCl",
    brands: ["Benadryl", "Dimine"],
    type: "alternative",
    alternativeFor: "cetirizine",
    results: [
      { pharmacy: "GreenLeaf Medicos",       distance: 1.4, price: 30,  qty: 4,  updated: "11 min ago" },
    ]
  },

  // ── Pain (topical / advanced) ─────────────────────────────────────────────
  "tramadol": {
    name: "Tramadol 50mg", generic: "Tramadol HCl",
    brands: ["Tramazac", "Ultram"],
    type: "unique", requiresRx: true,
    maxReservation: 1,
    results: [
      { pharmacy: "Sunrise Pharmacy",        distance: 2.7, price: 65,  qty: 3,  updated: "17 min ago" },
    ]
  },

  // ── Anti-malarial ─────────────────────────────────────────────────────────
  "chloroquine": {
    name: "Chloroquine 250mg", generic: "Chloroquine Phosphate",
    brands: ["Lariago", "Resochin"],
    type: "unique", requiresRx: true,
    results: [
      { pharmacy: "Jana Aushadhi Kendra",    distance: 0.9, price: 25,  qty: 4,  updated: "13 min ago" },
    ]
  },

  // ── Antacid ───────────────────────────────────────────────────────────────
  "antacid": {
    name: "Antacid Suspension", generic: "Aluminium + Magnesium Hydroxide",
    brands: ["Gelusil", "Digene", "Maalox"],
    type: "unique",
    results: [
      { pharmacy: "Wellness Plus Pharmacy",  distance: 0.6, price: 55,  qty: 8,  updated: "4 min ago" },
      { pharmacy: "CityCare Chemists",       distance: 1.1, price: 48,  qty: 5,  updated: "12 min ago" },
    ]
  },
};

// ─── Alternative suggestions ─────────────────────────────────────────────────
const ALTERNATIVE_SUGGESTIONS = {
  "azithromycin":   ["Doxycycline 100mg", "Amoxicillin 500mg", "Generic Azithromycin (unbranded)"],
  "omeprazole":     ["Pantoprazole 40mg", "Pan-D (Pantoprazole + Domperidone)"],
  "cetirizine":     ["Loratadine 10mg", "Diphenhydramine 25mg"],
  "clotrimazole":   ["Hydrocortisone 1% Cream"],
  "ibuprofen":      ["Paracetamol 500mg", "Diclofenac 50mg", "Nimesulide 100mg"],
  "paracetamol":    ["Ibuprofen 400mg", "Nimesulide 100mg"],
};

// ─── Live ticker ─────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { med: "Paracetamol 500mg",        pharmacy: "Wellness Plus Pharmacy",  status: "low" },
  { med: "Cetirizine 10mg",          pharmacy: "Jana Aushadhi Kendra",    status: "in"  },
  { med: "ORS Sachets",              pharmacy: "Wellness Plus Pharmacy",  status: "in"  },
  { med: "Azithromycin 500mg",       pharmacy: "CityCare Chemists",       status: "low" },
  { med: "Salbutamol Inhaler",       pharmacy: "Apollo Health Store",     status: "low" },
  { med: "Insulin Glargine",         pharmacy: "MedPoint 24x7",           status: "low" },
  { med: "Metformin 500mg",          pharmacy: "Jana Aushadhi Kendra",    status: "in"  },
  { med: "Omeprazole 20mg",          pharmacy: "Wellness Plus Pharmacy",  status: "low" },
  { med: "Doxycycline 100mg",        pharmacy: "Sunrise Pharmacy",        status: "low" },
  { med: "Vitamin D3 60000 IU",      pharmacy: "Apollo Health Store",     status: "out" },
];

// ─── Low-stock alerts (pharmacy dashboard) ───────────────────────────────────
const LOW_STOCK_DATA = [
  { name: "Azithromycin 500mg",      batch: "AZT-2291", qty: 4,  threshold: 10 },
  { name: "Insulin Glargine 100IU",  batch: "INS-0142", qty: 2,  threshold: 5  },
  { name: "Salbutamol Inhaler",      batch: "SAL-3390", qty: 2,  threshold: 5  },
  { name: "Vitamin D3 60000 IU",     batch: "VTD-2284", qty: 3,  threshold: 5  },
  { name: "Omeprazole 20mg",         batch: "OMZ-4412", qty: 4,  threshold: 8  },
  { name: "Paracetamol 500mg",       batch: "PCM-9981", qty: 5,  threshold: 10 },
  { name: "Amoxicillin 500mg",       batch: "AMX-7723", qty: 3,  threshold: 8  },
];

// ─── Full inventory (pharmacy dashboard) ─────────────────────────────────────
const INVENTORY_DATA = [
  { name: "Paracetamol 500mg",        batch: "PCM-9981", qty: 18, price: 28,  expiry: "2027-03-12", status: "low"      },
  { name: "Cetirizine 10mg",          batch: "CTZ-7732", qty: 15, price: 18,  expiry: "2028-01-15", status: "ok"       },
  { name: "Metformin 500mg",          batch: "MET-4471", qty: 12, price: 42,  expiry: "2027-11-20", status: "ok"       },
  { name: "Azithromycin 500mg",       batch: "AZT-2291", qty: 4,  price: 118, expiry: "2026-08-04", status: "low"      },
  { name: "ORS Sachets",              batch: "ORS-1182", qty: 20, price: 12,  expiry: "2027-06-10", status: "ok"       },
  { name: "Omeprazole 20mg",          batch: "OMZ-4412", qty: 10, price: 35,  expiry: "2027-05-18", status: "low"      },
  { name: "Insulin Glargine 100IU",   batch: "INS-0142", qty: 2,  price: 689, expiry: "2026-07-01", status: "low"      },
  { name: "Salbutamol Inhaler",       batch: "SAL-3390", qty: 2,  price: 145, expiry: "2027-02-28", status: "low"      },
  { name: "Amoxicillin 500mg",        batch: "AMX-7723", qty: 3,  price: 65,  expiry: "2026-09-30", status: "low"      },
  { name: "Vitamin D3 60000 IU",      batch: "VTD-2284", qty: 3,  price: 95,  expiry: "2026-06-28", status: "expiring" },
  { name: "Vitamin B12 500mcg",       batch: "B12-3391", qty: 6,  price: 55,  expiry: "2027-08-14", status: "ok"       },
  { name: "Ibuprofen 400mg",          batch: "IBP-5541", qty: 8,  price: 32,  expiry: "2027-10-05", status: "ok"       },
  { name: "Domperidone 10mg",         batch: "DPD-6612", qty: 8,  price: 25,  expiry: "2027-04-20", status: "ok"       },
  { name: "Metronidazole 400mg",      batch: "MTZ-6604", qty: 10, price: 20,  expiry: "2027-07-11", status: "ok"       },
  { name: "Clotrimazole 1% Cream",    batch: "CLT-1122", qty: 5,  price: 42,  expiry: "2027-12-01", status: "ok"       },
  { name: "Antacid Suspension",       batch: "ATC-8872", qty: 8,  price: 55,  expiry: "2027-09-15", status: "ok"       },
  { name: "Calcium + Vitamin D3",     batch: "CAL-2231", qty: 5,  price: 72,  expiry: "2027-03-30", status: "ok"       },
  { name: "Zinc 50mg",                batch: "ZNC-4421", qty: 10, price: 22,  expiry: "2027-11-10", status: "ok"       },
  { name: "Levothyroxine 50mcg",      batch: "LVT-9910", qty: 6,  price: 35,  expiry: "2027-01-22", status: "ok"       },
  { name: "Atorvastatin 10mg",        batch: "ATV-7761", qty: 4,  price: 58,  expiry: "2027-06-08", status: "ok"       },
  { name: "Amlodipine 5mg",           batch: "AML-3312", qty: 7,  price: 38,  expiry: "2027-08-25", status: "ok"       },
  { name: "Dextromethorphan 15mg",    batch: "DMT-5531", qty: 5,  price: 45,  expiry: "2027-05-14", status: "ok"       },
  { name: "Pantoprazole 40mg",        batch: "PNT-6643", qty: 7,  price: 28,  expiry: "2027-09-02", status: "ok"       },
  { name: "Chloroquine 250mg",        batch: "CLQ-2245", qty: 4,  price: 25,  expiry: "2027-04-17", status: "ok"       },
  { name: "Ciprofloxacin 500mg",      batch: "CPR-8812", qty: 4,  price: 72,  expiry: "2026-12-30", status: "ok"       },
  { name: "Montelukast 10mg",         batch: "MNT-3347", qty: 4,  price: 88,  expiry: "2027-07-19", status: "ok"       },
  { name: "Nimesulide 100mg",         batch: "NIM-4490", qty: 7,  price: 28,  expiry: "2027-02-10", status: "ok"       },
  { name: "Atenolol 50mg",            batch: "ATN-1178", qty: 5,  price: 30,  expiry: "2027-10-22", status: "ok"       },
  { name: "Telmisartan 40mg",         batch: "TLM-5512", qty: 4,  price: 55,  expiry: "2027-08-07", status: "ok"       },
  { name: "Tramadol 50mg",            batch: "TRM-9908", qty: 3,  price: 65,  expiry: "2026-11-15", status: "ok"       },
  { name: "Loratadine 10mg",          batch: "LOR-2281", qty: 5,  price: 22,  expiry: "2027-06-30", status: "ok"       },
  { name: "Glimepiride 2mg",          batch: "GLM-6634", qty: 4,  price: 68,  expiry: "2027-05-05", status: "ok"       },
  { name: "Doxycycline 100mg",        batch: "DOX-5510", qty: 5,  price: 55,  expiry: "2026-10-18", status: "ok"       },
  { name: "Diphenhydramine 25mg",     batch: "DPH-7723", qty: 4,  price: 30,  expiry: "2027-03-21", status: "ok"       },
  { name: "Hydrocortisone 1% Cream",  batch: "HYD-4481", qty: 3,  price: 48,  expiry: "2027-04-12", status: "ok"       },
  { name: "Diclofenac 50mg",          batch: "DCL-3312", qty: 5,  price: 40,  expiry: "2027-01-08", status: "ok"       },
  { name: "Calcium + Vitamin D3",     batch: "CAL-2232", qty: 4,  price: 68,  expiry: "2027-11-30", status: "ok"       },
  { name: "Zinc 50mg",                batch: "ZNC-4422", qty: 8,  price: 22,  expiry: "2027-10-01", status: "ok"       },
  { name: "Vitamin B12 500mcg",       batch: "B12-3392", qty: 4,  price: 50,  expiry: "2027-12-14", status: "ok"       },
  { name: "Antacid Suspension",       batch: "ATC-8873", qty: 5,  price: 48,  expiry: "2027-08-08", status: "ok"       },
];

// ─── Reservations ────────────────────────────────────────────────────────────
const RESERVATIONS_DATA = [
  { id: "MF-583021", customer: "Aarav Sharma",  medicine: "Paracetamol 500mg",   qty: 2, status: "pending",     time: "5 min ago"  },
  { id: "MF-583018", customer: "Priya Nair",    medicine: "Metformin 500mg",      qty: 1, status: "pending",     time: "12 min ago" },
  { id: "MF-583002", customer: "Rohan Gupta",   medicine: "Azithromycin 500mg",  qty: 1, status: "awaiting_rx", time: "22 min ago" },
  { id: "MF-582990", customer: "Sneha Iyer",    medicine: "Cetirizine 10mg",      qty: 2, status: "accepted",    time: "40 min ago" },
  { id: "MF-582977", customer: "Karan Mehta",   medicine: "ORS Sachets",          qty: 3, status: "collected",   time: "1 hr ago"   },
];

// ─── Prescription queue ───────────────────────────────────────────────────────
const RX_QUEUE_DATA = [
  { id: "RX-7741", customer: "Rohan Gupta",  medicine: "Azithromycin 500mg",    uploaded: "22 min ago", status: "pending"  },
  { id: "RX-7738", customer: "Meera Joshi",  medicine: "Insulin Glargine 100IU",uploaded: "48 min ago", status: "pending"  },
  { id: "RX-7729", customer: "Vikram Rao",   medicine: "Amoxicillin 500mg",     uploaded: "2 hr ago",   status: "approved" },
];

// ─── Collection desk ─────────────────────────────────────────────────────────
const COLLECTION_DATA = [
  { id: "MF-582990", customer: "Sneha Iyer",    medicine: "Cetirizine 10mg",    qty: 2, status: "ready"     },
  { id: "MF-582940", customer: "Ishaan Kapoor", medicine: "Metformin 500mg",    qty: 1, status: "ready"     },
  { id: "MF-582901", customer: "Ananya Das",    medicine: "Vitamin D3 60000 IU",qty: 1, status: "collected" },
];

// ─── Medicine info panel ─────────────────────────────────────────────────────
const MED_INFO_DATA = [
  { name: "Paracetamol",          generic: "Paracetamol",                       dosage: "500–650mg every 4–6 hrs",           alt: "Ibuprofen, Nimesulide" },
  { name: "Ibuprofen",            generic: "Ibuprofen",                         dosage: "400mg every 6–8 hrs after meals",   alt: "Paracetamol, Diclofenac, Nimesulide" },
  { name: "Diclofenac",           generic: "Diclofenac Sodium",                 dosage: "50mg 2–3× daily after meals",       alt: "Ibuprofen, Nimesulide" },
  { name: "Nimesulide",           generic: "Nimesulide",                        dosage: "100mg twice daily after meals",     alt: "Ibuprofen, Paracetamol" },
  { name: "Azithromycin",         generic: "Azithromycin",                      dosage: "500mg once daily, 3 days",          alt: "Doxycycline, Amoxicillin" },
  { name: "Amoxicillin",          generic: "Amoxicillin",                       dosage: "500mg every 8 hrs, 5–7 days",       alt: "Azithromycin, Doxycycline" },
  { name: "Doxycycline",          generic: "Doxycycline",                       dosage: "100mg twice daily, 7–10 days",      alt: "Azithromycin, Amoxicillin" },
  { name: "Ciprofloxacin",        generic: "Ciprofloxacin",                     dosage: "500mg twice daily, 5–7 days",       alt: "Azithromycin, Doxycycline" },
  { name: "Metronidazole",        generic: "Metronidazole",                     dosage: "400mg 3× daily, 5–7 days",          alt: "Tinidazole, Secnidazole" },
  { name: "Metformin",            generic: "Metformin HCl",                     dosage: "500mg with meals, 2× daily",        alt: "Glimepiride, Sitagliptin" },
  { name: "Glimepiride",          generic: "Glimepiride",                       dosage: "2mg once daily before breakfast",   alt: "Metformin, Sitagliptin" },
  { name: "Insulin Glargine",     generic: "Insulin Glargine",                  dosage: "As prescribed, once daily",         alt: "Insulin Detemir" },
  { name: "Amlodipine",           generic: "Amlodipine",                        dosage: "5–10mg once daily",                 alt: "Telmisartan, Atenolol" },
  { name: "Atenolol",             generic: "Atenolol",                          dosage: "50mg once daily",                   alt: "Amlodipine, Telmisartan" },
  { name: "Telmisartan",          generic: "Telmisartan",                       dosage: "40mg once daily",                   alt: "Amlodipine, Atenolol" },
  { name: "Cetirizine",           generic: "Cetirizine HCl",                    dosage: "10mg once daily",                   alt: "Loratadine, Diphenhydramine" },
  { name: "Loratadine",           generic: "Loratadine",                        dosage: "10mg once daily",                   alt: "Cetirizine, Diphenhydramine" },
  { name: "Salbutamol",           generic: "Salbutamol",                        dosage: "1–2 puffs every 4–6 hrs (inhaler)", alt: "Formoterol, Ipratropium" },
  { name: "Montelukast",          generic: "Montelukast",                       dosage: "10mg once daily at bedtime",        alt: "Cetirizine, Salbutamol" },
  { name: "Omeprazole",           generic: "Omeprazole",                        dosage: "20mg before meals, once daily",     alt: "Pantoprazole, Rabeprazole" },
  { name: "Pantoprazole",         generic: "Pantoprazole",                      dosage: "40mg before meals, once daily",     alt: "Omeprazole, Rabeprazole" },
  { name: "Domperidone",          generic: "Domperidone",                       dosage: "10mg 3× daily before meals",        alt: "Metoclopramide, Ondansetron" },
  { name: "ORS",                  generic: "Oral Rehydration Salts",            dosage: "1 sachet in 200ml water as needed", alt: "Electral, Pedialyte" },
  { name: "Vitamin D3",           generic: "Cholecalciferol",                   dosage: "60000 IU once weekly, 8–12 weeks",  alt: "Calcium + D3 combination" },
  { name: "Vitamin B12",          generic: "Methylcobalamin",                   dosage: "500mcg once daily",                 alt: "Cyanocobalamin injection" },
  { name: "Calcium + Vitamin D3", generic: "Calcium Carbonate",                 dosage: "1 tablet twice daily after meals",  alt: "Shelcal, Ostocalcium" },
  { name: "Zinc",                 generic: "Zinc Sulfate",                      dosage: "50mg once daily, 2–4 weeks",        alt: "Zincovit, Multivitamin" },
  { name: "Clotrimazole",         generic: "Clotrimazole",                      dosage: "Apply thin layer 2–3× daily",       alt: "Hydrocortisone, Miconazole" },
  { name: "Hydrocortisone",       generic: "Hydrocortisone",                    dosage: "Apply thin layer 2–4× daily",       alt: "Clotrimazole, Betamethasone" },
  { name: "Levothyroxine",        generic: "Levothyroxine Sodium",              dosage: "50mcg once daily, empty stomach",   alt: "Liothyronine" },
  { name: "Atorvastatin",         generic: "Atorvastatin",                      dosage: "10–40mg once daily at night",       alt: "Rosuvastatin, Simvastatin" },
  { name: "Dextromethorphan",     generic: "Dextromethorphan HBr",              dosage: "15–30mg every 6–8 hrs",             alt: "Diphenhydramine, Codeine" },
  { name: "Diphenhydramine",      generic: "Diphenhydramine HCl",               dosage: "25mg every 6–8 hrs",                alt: "Cetirizine, Loratadine" },
  { name: "Tramadol",             generic: "Tramadol HCl",                      dosage: "50mg every 4–6 hrs (max 400mg/day)",alt: "Codeine, Diclofenac" },
  { name: "Chloroquine",          generic: "Chloroquine Phosphate",             dosage: "250mg daily or as prescribed",      alt: "Hydroxychloroquine, Primaquine" },
  { name: "Antacid",              generic: "Aluminium + Magnesium Hydroxide",   dosage: "10–20ml or 1–2 tablets after meals",alt: "Omeprazole, Pantoprazole" },
];

// ─── Pharmacy verification queue ─────────────────────────────────────────────
const VERIFICATION_DATA = [
  { name: "Sunrise Pharmacy",        owner: "R. Patel",  license: "DL-UK-22910", submitted: "2 days ago", status: "pending"  },
  { name: "HealthFirst Chemists",    owner: "S. Reddy",  license: "DL-UK-18820", submitted: "5 days ago", status: "pending"  },
  { name: "Wellness Plus Pharmacy",  owner: "A. Kumar",  license: "DL-UK-90121", submitted: "Verified",   status: "approved" },
  { name: "Quick Meds 24x7",         owner: "N. Singh",  license: "DL-UK-44210", submitted: "1 day ago",  status: "pending"  },
];

// ─── Audit log ───────────────────────────────────────────────────────────────
const AUDIT_DATA = [
  { time: "10:42 AM", actor: "System",                       action: "Flagged: 6 reservations from same account in 1 hr", level: "warn"    },
  { time: "09:15 AM", actor: "Admin: J. Verma",             action: "Suspended account: user_4471 (repeated no-shows)",  level: "danger"  },
  { time: "08:50 AM", actor: "Pharmacist: Wellness Plus",   action: "Approved prescription RX-7729",                     level: "ok"      },
  { time: "07:30 AM", actor: "System",                       action: "Auto-expired 3 unclaimed reservations",             level: "neutral" },
  { time: "Yesterday",actor: "Admin: J. Verma",             action: "Approved pharmacy registration: Jana Aushadhi Kendra",level: "ok"   },
];

// ─── Demand chart data ────────────────────────────────────────────────────────
const DEMAND_DATA = [
  { name: "Paracetamol 500mg",    value: 88 },
  { name: "Cetirizine 10mg",      value: 74 },
  { name: "ORS Sachets",          value: 68 },
  { name: "Metformin 500mg",      value: 60 },
  { name: "Azithromycin 500mg",   value: 52 },
  { name: "Omeprazole 20mg",      value: 45 },
  { name: "Salbutamol Inhaler",   value: 38 },
];
