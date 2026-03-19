const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const getNextSequence = async (name) => {
  const ret = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return ret.seq;
};

const getNextId = async (prefix = 'AIMX2026') => {
  const seq = await getNextSequence('registration');
  return `${prefix}-${seq.toString().padStart(4, '0')}`;
};

const resetCounter = async (name) => {
  await Counter.findOneAndDelete({ _id: name });
};

module.exports = { getNextId, getNextSequence, resetCounter };

