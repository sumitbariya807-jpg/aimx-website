const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Organizer = require('../models/Organizer');
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://sunnybariya:sunnybariya1@cluster0.xxgfaha.mongodb.net/aimx?retryWrites=true&w=majority';

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for admin reset');

    const password = 'admin123';
    const hash = await bcrypt.hash(password, 12);
    
    const result = await Organizer.findOneAndUpdate(
      { email: 'admin@aimx.com' },
      { 
        email: 'admin@aimx.com',
        password: hash,
        name: 'AIMX Admin'
      },
      { upsert: true, new: true }
    );
    
    console.log('✅ Admin user reset/created:');
    console.log('- Email: admin@aimx.com');
    console.log('- Password: admin123');
    console.log('- ID:', result._id);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
})();

