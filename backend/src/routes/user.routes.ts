import express from 'express';
import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const router = express.Router();

// Protected route to get current user profile
router.get('/profile', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.patch('/profile', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only allow specific fields to be updated
    const { username, email } = req.body;
    const updateData: any = {};
    
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    
    // Check if email/username is already taken
    if (email || username) {
      const query: any = [];
      if (email) query.push({ email });
      if (username) query.push({ username });
      
      const existingUser = await User.findOne({ 
        $or: query,
        _id: { $ne: req.user.id } // Exclude current user
      });
      
      if (existingUser) {
        if (email && existingUser.email === email) {
          return next(new AppError('Email already in use', 400));
        }
        if (username && existingUser.username === username) {
          return next(new AppError('Username already taken', 400));
        }
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.patch('/change-password', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return next(new AppError('Current password and new password are required', 400));
    }
    
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Check if current password is correct
    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError('Current password is incorrect', 401));
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    // Generate new token
    const token = require('jsonwebtoken').sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );
    
    // Remove password from output
    user.password = undefined;
    
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Admin routes
router.use(protect);
router.use(restrictTo('admin'));

// Get all users (admin only)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find();
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update user role (admin only)
router.patch('/:id/role', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return next(new AppError('Invalid role. Must be "user" or "admin"', 400));
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;