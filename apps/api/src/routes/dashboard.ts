import { Router } from 'express';
import { dashboardController } from '../controllers/DashboardController.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/stats', ensureAuthenticated, (req, res, next) =>
  dashboardController.getStats(req, res, next)
);
router.get('/pending-reports', ensureAuthenticated, (req, res, next) =>
  dashboardController.getPendingReports(req, res, next)
);

export default router;
