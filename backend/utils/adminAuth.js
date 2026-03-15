const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'adminaimx2026';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'aimx@aimsr111';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'aimx-admin-token';

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
};

const verifyAdmin = (req, res, next) => {
  const token = getTokenFromHeader(req);

  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized admin access' });
  }

  next();
};

const validateAdminCredentials = (username, password) => {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
};

module.exports = {
  verifyAdmin,
  validateAdminCredentials,
  ADMIN_TOKEN
};
