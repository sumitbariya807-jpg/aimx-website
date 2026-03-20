const express = require('express');
const XLSX = require('xlsx');
const router = express.Router();
const Participant = require('../models/Participant');
const Organizer = require('../models/Organizer');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'aimx-jwt-secret-2026';
const { verifyOrganizer } = require('../utils/adminAuth');
require('../utils/emailService')
const { getNextId } = require('../utils/counter');

// Registration - no auth required
router.post('/register', async (req, res) => {
  try {
    const data = req.body;
    const participantId = await getNextId();
    const upiRef = data.amount > 0 ? `_${Date.now()}${Math.random().toString(36).slice(-4).toUpperCase()}` : null;
    const upiUrl = data.amount > 0 
      ? `upi://pay?pa=ashutoshdp2003@okaxis&pn=AIMX%20Events&am=${data.amount}&cu=INR&ref=${encodeURIComponent(upiRef)}`
      : null;
    
    const participantData = {
      ...data,
      participantId,
      upiRef,
      status: 'pending',
      checkedIn: false
    };
    
    const participant = new Participant(participantData);
    await participant.save();

    try {
      await sendRegistrationEmail(participant);
    } catch (emailErr) {
      console.error('Registration email error:', emailErr.message);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Registration created successfully - Pending Verification', 
      participantId,
      upiUrl,
      upiRef 
    });
  } catch (error) {
    console.error('Register error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Registration ID already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Admin routes - auth required
router.get('/list', verifyOrganizer, async (req, res) => {
  try {
    const participants = await Participant.find().sort({ createdAt: -1 });
    res.json(participants);
  } catch (error) {
    console.error('Get all error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/export/excel', verifyOrganizer, async (req, res) => {
  try {
    const participants = await Participant.find().sort({ createdAt: -1 }).lean();
    const rows = participants.map((p) => ({
      'Participant ID': p.participantId,
      Name: p.name,
      Email: p.email,
      Phone: p.phone,
      College: p.college,
      Event: p.eventName,
      'Event Subname': p.eventSubname || '',
      'Team Name': p.teamName || '',
      'Transaction ID': p.transactionId,
      Amount: `₹${p.amount}`,
      'UPI Ref': p.upiRef || '',
      Status: p.status.toUpperCase(),
      'Checked In': p.checkedIn ? 'YES' : 'NO',
      Date: p.date
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="aimx-participants.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Export excel error:', error);
    res.status(500).json({ error: 'Failed to export excel' });
  }
});

// Public verification
router.get('/verify/:registrationId', async (req, res) => {
  try {
    const participant = await Participant.findOne({ participantId: req.params.registrationId });
    if (!participant) return res.status(404).json({ error: 'Participant not found' });
    
    res.json({
      name: participant.name,
      event: participant.eventName,
      registrationId: participant.participantId,
      paymentStatus: participant.status === 'approved' ? 'Approved' : 'Pending',
      checkInStatus: participant.checkedIn
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:participantId', async (req, res) => {
  try {
    const participant = await Participant.findOne({ participantId: req.params.participantId });
    if (!participant) return res.status(404).json({ error: 'Participant not found' });
    res.json(participant);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin status update
router.patch('/:participantId/status', verifyOrganizer, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const participant = await Participant.findOneAndUpdate(
      { participantId: req.params.participantId },
      { status },
      { new: true }
    );

    if (!participant) return res.status(404).json({ error: 'Participant not found' });

    if (status === 'approved' || status === 'rejected') {
      try {
        await sendStatusEmail(participant, status);
      } catch (emailErr) {
        console.error('Status email error:', emailErr.message);
      }
    }

    res.json({ success: true, status, participant });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:participantId', verifyOrganizer, async (req, res) => {
  try {
    const participant = await Participant.findOneAndDelete({ participantId: req.params.participantId });
    if (!participant) return res.status(404).json({ error: 'Participant not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Check-in routes
router.post('/checkin/:registrationId', async (req, res) => {
  try {
    const registrationId = req.params.registrationId;
    const participant = await Participant.findOne({ participantId: registrationId });
    
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }
    
    if (participant.checkedIn) {
      return res.status(400).json({ 
        error: 'Participant already checked in.',
        participant: {
          name: participant.name,
          event: participant.eventName,
          registrationId: participant.participantId,
          paymentStatus: participant.status === 'approved' ? 'Approved' : 'Pending',
          checkInStatus: true
        }
      });
    }
    
    const updated = await Participant.findOneAndUpdate(
      { participantId: registrationId },
      { checkedIn: true },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Checked in successfully!',
      participant: {
        name: updated.name,
        event: updated.eventName,
        registrationId: updated.participantId,
        paymentStatus: updated.status === 'approved' ? 'Approved' : 'Pending',
        checkInStatus: true
      }
    });
  } catch (error) {
    console.error('Checkin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Legacy QR scanner
router.post('/checkin', async (req, res) => {
  try {
    const { qrData } = req.body;
    let ticket;
    try {
      ticket = JSON.parse(qrData);
    } catch {
      return res.status(400).json({ error: 'Invalid QR code data' });
    }

    if (!ticket.id || !ticket.name || !ticket.event || !ticket.mobile) {
      return res.status(400).json({ error: 'Invalid ticket format' });
    }

    const participant = await Participant.findOne({ participantId: ticket.id, phone: ticket.mobile });
    
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found or mismatch' });
    }
    
    if (participant.checkedIn) {
      return res.status(400).json({ error: 'Already checked in' });
    }
    
    await Participant.findOneAndUpdate(
      { participantId: ticket.id, phone: ticket.mobile },
      { checkedIn: true }
    );

    res.json({
      success: true,
      message: 'Checked in successfully!',
      participant: {
        id: participant.participantId,
        name: participant.name,
        event: participant.eventName,
        phone: participant.phone,
        status: participant.status,
        checkedIn: true
      }
    });
  } catch (error) {
    console.error('Checkin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
