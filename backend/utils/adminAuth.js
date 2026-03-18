const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'aimx-jwt-secret-2026';

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
};

const verifyOrganizer = (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.organizer = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = {
  verifyOrganizer,
  getTokenFromHeader
};
