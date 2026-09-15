const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
app.use('/api/admin', require('./routes/admin'));

const app = express();

app.use(cors());
app.use(express.json());

// Main Auth Route Mount
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

module.exports = app;