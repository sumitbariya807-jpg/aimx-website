const express = require('express');
const XLSX = require('xlsx');
const router = express.Router();
const Participant = require('../models/Participant');
const { verifyAdmin, validateAdminCredentials, ADMIN_TOKEN } = require('../utils/adminAuth');
const { sendRegistrationEmail, sendStatusEmail } = require('../utils/emailService');

// POST /api/participants/register - Create new registration
router.post('/register', async (req, res) => {
  try {
    const data = req.body;
    const participant = new Participant(data);
    await participant.save();

    try {
      await sendRegistrationEmail(participant);
    } catch (emailErr) {
      console.error('Registration email error:', emailErr.message);
    }

    res.status(201).json({ message: 'Registered Successfully', participantId: data.participantId });
  } catch (error) {
    console.error('Register error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Participant ID already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/participants/admin/login
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!validateAdminCredentials(username, password)) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  res.json({ success: true, token: ADMIN_TOKEN });
});

// GET /api/participants - Get all participants (admin only)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const participants = await Participant.find().sort({ createdAt: -1 });
    res.json(participants);
  } catch (error) {
    console.error('Get all error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/participants/export/excel - Download all participants as Excel (admin only)
router.get('/export/excel', verifyAdmin, async (req, res) => {
  try {
    const participants = await Participant.find().sort({ createdAt: -1 }).lean();
    const rows = participants.map((p) => ({
      participantId: p.participantId,
      name: p.name,
      email: p.email,
      phone: p.phone,
      college: p.college,
      eventName: p.eventName,
      eventSubname: p.eventSubname,
      teamName: p.teamName || '',
      transactionId: p.transactionId,
      amount: p.amount,
      status: p.status,
      date: p.date
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

// GET /api/participants/:id - Get by participantId (participant login)
router.get('/:participantId', async (req, res) => {
  try {
    const participant = await Participant.findOne({ participantId: req.params.participantId });
    if (!participant) return res.json([]);
    res.json(participant);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/participants/:id/status - Update status (admin only)
router.patch('/:participantId/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
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

// DELETE /api/participants/:id - Delete participant (admin only)
router.delete('/:participantId', verifyAdmin, async (req, res) => {
  try {
    const participant = await Participant.findOneAndDelete({ participantId: req.params.participantId });
    if (!participant) return res.status(404).json({ error: 'Participant not found' });
    res.json({ success: true, message: 'Participant deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

