const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from Bearer token in Authorization header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    // Get token from cookie
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Special handling for development tokens (only in development environment)
    if (process.env.NODE_ENV !== 'production' && token.startsWith('dev_token_')) {
      // Check if we have a user ID in localStorage that matches this dev token
      const userIdFromToken = req.headers['x-user-id'];
      
      if (userIdFromToken) {
        // Try to find the user with this ID first
        const userById = await User.findById(userIdFromToken).catch(() => null);
        
        if (userById) {
          req.user = userById;
          return next();
        }
      }
      
      // Fallback: find a user with the matching role (admin or user based on token)
      const isAdminToken = token.includes('admin');
      const user = await User.findOne({ 
        role: isAdminToken ? 'admin' : 'user' 
      });
      
      if (user) {
        req.user = user;
        return next();
      }
      
      // Last fallback: find any user
      const anyUser = await User.findOne();
      if (!anyUser) {
        return res.status(401).json({
          success: false,
          message: 'User not found or no longer exists'
        });
      }
      
      req.user = anyUser;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user to request
    const user = await User.findById(decoded.id);
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or no longer exists'
      });
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found in the request'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};