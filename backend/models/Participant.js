const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  participantId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  college: { type: String, required: true },
  eventId: { type: String, required: true },
  eventName: { type: String, required: true },
  eventSubname: { type: String, required: true },
  teamName: String,
  transactionId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  screenshot: String, // base64
  date: { type: String, default: () => new Date().toLocaleDateString() },
  id: String // Legacy field from frontend
}, {
  timestamps: true
});

module.exports = mongoose.model('Participant', participantSchema);

