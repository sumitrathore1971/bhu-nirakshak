import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import Report from '../models/Report.js';
import User from '../models/User.js';

const router = Router();

// Get all reports (Admin only)
router.get('/', 
  authMiddleware, 
  allowRoles(['Admin']), 
  async (req, res) => {
    try {
      const { page = 1, limit = 10, status, category, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      
      const query = { isActive: true };
      if (status) query.status = status;
      if (category) query.category = category;
      
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
      
      const reports = await Report.find(query)
        .populate('reporter.userId', 'name email')
        .populate('assignedTo', 'name email')
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      
      const total = await Report.countDocuments(query);
      
      res.json({
        reports,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalReports: total
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get reports by user (Citizen can see their own reports)
router.get('/my-reports', 
  authMiddleware, 
  allowRoles(['Citizen']), 
  async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      
      const query = { 
        'reporter.userId': req.user.id,
        isActive: true 
      };
      if (status) query.status = status;
      
      const reports = await Report.find(query)
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      
      const total = await Report.countDocuments(query);
      
      res.json({
        reports,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalReports: total
      });
    } catch (error) {
      console.error('Error fetching user reports:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get single report by ID
router.get('/:id', 
  authMiddleware, 
  async (req, res) => {
    try {
      const report = await Report.findById(req.params.id)
        .populate('reporter.userId', 'name email')
        .populate('assignedTo', 'name email')
        .populate('verifiedBy', 'name email')
        .populate('actionTakenBy', 'name email')
        .populate('closedBy', 'name email')
        .populate('notes.addedBy', 'name email');
      
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      
      // Check if user has permission to view this report
      if (req.user.role === 'Citizen' && report.reporter.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json({ report });
    } catch (error) {
      console.error('Error fetching report:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Create new report (Citizen only)
router.post('/', 
  authMiddleware, 
  allowRoles(['Citizen']), 
  async (req, res) => {
    try {
      const { 
        fullName, 
        phone, 
        email, 
        description, 
        category, 
        date, 
        location,
        title 
      } = req.body;
      
      // Validation
      if (!fullName || !phone || !description || !category || !date || !location || !title) {
        return res.status(400).json({ 
          message: 'Missing required fields',
          required: ['fullName', 'phone', 'description', 'category', 'date', 'location', 'title']
        });
      }
      
      // Validate phone number format
      if (!/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({ message: 'Invalid phone number format. Must be 10 digits.' });
      }
      
      // Validate email format if provided
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
      }
      
      // Validate coordinates (allow 0 values)
      const latOk = Number.isFinite(Number(location.lat));
      const lngOk = Number.isFinite(Number(location.lng));
      if (!latOk || !lngOk) {
        return res.status(400).json({ message: 'Location coordinates are required.' });
      }
      
      // Validate date
      const observationDate = new Date(date);
      if (isNaN(observationDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format.' });
      }
      
      // Create report data
      const reportData = {
        reporter: {
          userId: req.user.id,
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email ? email.trim().toLowerCase() : undefined
        },
        title: title.trim(),
        description: description.trim(),
        category,
        dateOfObservation: observationDate,
        location: {
          coordinates: {
            type: 'Point',
            coordinates: [parseFloat(location.lng), parseFloat(location.lat)]
          },
          address: location.address || '',
          area: location.area || ''
        },
        media: [] // Will be handled separately for file uploads
      };
      
      // Save with retry on duplicate key for reportId only (extremely rare with UUID)
      let report;
      let lastDupIdError = null;
      const maxAttempts = 5;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          report = new Report(reportData);
          await report.save();
          lastDupIdError = null;
          break;
        } catch (err) {
          // Only retry when duplicate key is for reportId; otherwise bubble up
          if (err && err.code === 11000) {
            const isReportIdDup = err.keyPattern?.reportId || String(err.message || '').includes('reportId');
            if (isReportIdDup) {
              lastDupIdError = err;
              const backoffMs = 10 * Math.pow(2, attempt); // 10,20,40,80,160
              await new Promise(resolve => setTimeout(resolve, backoffMs));
              continue;
            }
          }
          throw err;
        }
      }
      if (lastDupIdError) {
        return res.status(503).json({ message: 'Temporary ID generation conflict. Please try again.' });
      }
      
      // Populate reporter info for response
      await report.populate('reporter.userId', 'name email');
      
      res.status(201).json({ 
        message: 'Report submitted successfully!',
        report,
        success: true
      });
    } catch (error) {
      console.error('Error creating report:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: validationErrors 
        });
      }
      
      // Handle duplicate key errors
      if (error.code === 11000) {
        console.error('Duplicate key on report create:', {
          keyPattern: error.keyPattern,
          keyValue: error.keyValue,
          message: error.message
        });
        // If it's clearly the reportId index, return specific message; otherwise, generic retry advice
        const isReportIdDup = error.keyPattern?.reportId || String(error.message || '').includes('reportId');
        return res.status(400).json({ message: isReportIdDup ? 'Report ID already exists. Please try again.' : 'Temporary ID generation conflict. Please try again.' });
      }
      
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update report status (Enforcement/Admin only)
router.put('/:id/status', 
  authMiddleware, 
  allowRoles(['Enforcement', 'Admin']), 
  async (req, res) => {
    try {
      const { status, notes } = req.body;
      const { id } = req.params;

      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }

      const report = await Report.findById(id);
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      // Update status
      await report.updateStatus(status, req.user.id);
      
      // Add note if provided
      if (notes && notes.trim()) {
        await report.addNote(notes.trim(), req.user.id, req.user.role === 'Admin');
      }
      
      // Populate for response
      await report.populate('reporter.userId', 'name email');
      await report.populate('assignedTo', 'name email');
      
      res.json({ 
        message: 'Report status updated successfully',
        report
      });
    } catch (error) {
      console.error('Error updating report status:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Assign report to enforcement officer (Admin only)
router.put('/:id/assign', 
  authMiddleware, 
  allowRoles(['Admin']), 
  async (req, res) => {
    try {
      const { assignedTo } = req.body;
      const { id } = req.params;

      if (!assignedTo) {
        return res.status(400).json({ message: 'Assigned user ID is required' });
      }

      // Verify the assigned user exists and is an enforcement officer
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser || assignedUser.role !== 'Enforcement') {
        return res.status(400).json({ message: 'Invalid enforcement officer' });
      }

      const report = await Report.findByIdAndUpdate(
        id,
        { assignedTo },
        { new: true }
      ).populate('reporter.userId', 'name email')
       .populate('assignedTo', 'name email');

      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      res.json({ 
        message: 'Report assigned successfully',
        report
      });
    } catch (error) {
      console.error('Error assigning report:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Add note to report
router.post('/:id/notes', 
  authMiddleware, 
  async (req, res) => {
    try {
      const { content, isInternal = false } = req.body;
      const { id } = req.params;

      if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Note content is required' });
      }

      const report = await Report.findById(id);
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      // Check permissions
      if (req.user.role === 'Citizen' && report.reporter.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await report.addNote(content.trim(), req.user.id, isInternal && req.user.role === 'Admin');
      
      await report.populate('notes.addedBy', 'name email');
      
      res.json({ 
        message: 'Note added successfully',
        notes: report.notes
      });
    } catch (error) {
      console.error('Error adding note:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get reports statistics (Admin/Enforcement only)
router.get('/stats/overview', 
  authMiddleware, 
  allowRoles(['Admin', 'Enforcement']), 
  async (req, res) => {
    try {
      const stats = await Report.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      const totalReports = await Report.countDocuments({ isActive: true });
      const recentReports = await Report.countDocuments({
        isActive: true,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });
      
      const categoryStats = await Report.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ]);
      
      res.json({
        statusStats: stats,
        totalReports,
        recentReports,
        categoryStats
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

export default router;
