const express = require('express');
const jwt = require('jsonwebtoken');
const Organizer = require('../models/Organizer');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'aimx-jwt-secret-2026';

// POST /api/organizers/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const organizer = new Organizer({ email, password, name });
    await organizer.save();
    res.status(201).json({ success: true, message: 'Organizer registered' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/organizers/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const organizer = await Organizer.findOne({ email });
    if (!organizer || !(await organizer.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
      console.log(req.body);
    }

    const token = jwt.sign(
      { id: organizer._id, email: organizer.email, role: organizer.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, organizer: { id: organizer._id, email: organizer.email, name: organizer.name } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

