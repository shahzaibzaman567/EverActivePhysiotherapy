import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  getAuditLogs,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply global protection & admin authorization to all routes in this file
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/audit-logs', getAuditLogs);

export default router;
