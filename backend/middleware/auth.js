const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

// Authenticate JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await executeQuery(`
      SELECT u.*, r.name as role_name, r.permissions as role_permissions, d.name as department_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.id = ? AND u.is_active = TRUE
    `, [decoded.userId]);

    if (user.length === 0) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    const permissions = user[0].role_permissions ? JSON.parse(user[0].role_permissions) : [];
    req.user = {
      ...user[0],
      permissions
    };
    delete req.user.role_permissions;
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Check specific permission
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Check if user belongs to department
const checkDepartmentAccess = (req, res, next) => {
  const departmentId = req.params.departmentId || req.body.department_id;
  
  if (req.user.role_name === 'System Admin' || req.user.role_name === 'Head Of Production') {
    return next();
  }
  
  if (req.user.department_id != departmentId) {
    return res.status(403).json({ error: 'Access denied to this department' });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  checkPermission,
  checkDepartmentAccess
};