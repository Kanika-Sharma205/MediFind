const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const medicineRoutes = require('./routes/medicines');
const pharmacyRoutes = require('./routes/pharmacies');
const reservationRoutes = require('./routes/reservations');
const prescriptionRoutes = require('./routes/prescriptions');

// Allow cross-origin requests
app.use(cors());
app.use(express.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MediFind secure core listening cleanly on port ${PORT}`);
});