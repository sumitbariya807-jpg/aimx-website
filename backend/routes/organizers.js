const express = require('express');
const jwt = require('jsonwebtoken');
const Organizer = require('../models/Organizer');
const { sendRegistrationEmail } = require('../utils/emailService');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'aimx-jwt-secret-2026';

// POST /api/organizers/register
router.post('/organizers/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const organizer = new Organizer({ email, password, name });
    await organizer.save();

    try {
      // Send welcome email to new organizer (admin)
      await sendRegistrationEmail({
        name: organizer.name,
        email: organizer.email,
        phone: organizer.email, // placeholder
        college: 'Admin/Organizer',
        eventName: 'AIMX Admin Dashboard',
        eventId: 'ADMIN-2026',
        amount: 0,
        transactionId: 'N/A',
        status: 'approved',
        participantId: `ORG-${organizer._id.slice(-6).toUpperCase()}`
      });
      console.log(`✅ Welcome email sent to organizer: ${organizer.email}`);
    } catch (emailErr) {
      console.error('Organizer welcome email error:', emailErr.message);
      // Don't fail registration if email fails
    }

    res.status(201).json({ success: true, message: 'Organizer registered' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/organizers/login
router.post('/organizers/login', async (req, res) => {
  try {
    const { username, password } = req.body;  // Match frontend payload
    const email = username ? username.trim().toLowerCase() : '';
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const organizer = await Organizer.findOne({ email });
    if (!organizer || !(await organizer.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { organizer: { id: organizer._id, email: organizer.email, name: organizer.name } }, 
      JWT_SECRET
    );

    res.json({ 
      success: true,
      token, 
      organizer: { id: organizer._id, email: organizer.email, name: organizer.name } 
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

