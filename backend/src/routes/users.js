import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import User from '../models/User.js';

const router = Router();

// Get all users (Admin only)
router.get('/', 
  authMiddleware, 
  allowRoles(['Admin']), 
  async (req, res) => {
    try {
      const users = await User.find({}).select('-password');
      res.json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get user by ID (Admin only)
router.get('/:id', 
  authMiddleware, 
  allowRoles(['Admin']), 
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ user });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update user role (Admin only)
router.put('/:id/role', 
  authMiddleware, 
  allowRoles(['Admin']), 
  async (req, res) => {
    try {
      const { role } = req.body;
      const { id } = req.params;

      if (!['Citizen', 'Enforcement', 'Admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      const user = await User.findByIdAndUpdate(
        id, 
        { role }, 
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ 
        message: 'User role updated successfully',
        user 
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete user (Admin only)
router.delete('/:id', 
  authMiddleware, 
  allowRoles(['Admin']), 
  async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
