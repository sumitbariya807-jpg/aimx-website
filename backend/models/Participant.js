const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  participantId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  college: { type: String, required: true },
  eventId: { type: String, required: true },
  eventName: { type: String, required: true },
  eventSubname: String,
  teamName: String,
  transactionId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  screenshot: String, // base64
  upiRef: String,
  qrTicket: String, // JSON {"id": "...", "name": "...", "event": "...", "mobile": "..."}
  checkedIn: { type: Boolean, default: false },
  date: { type: String, default: () => new Date().toLocaleDateString() },
  id: String // Legacy field from frontend
}, {
  timestamps: true
});

module.exports = mongoose.model('Participant', participantSchema);

