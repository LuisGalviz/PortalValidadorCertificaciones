import { Router } from 'express';
import { dashboardController } from '../controllers/DashboardController.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/stats', ensureAuthenticated, (req, res) => dashboardController.getStats(req, res));
router.get('/pending-reports', ensureAuthenticated, (req, res) =>
  dashboardController.getPendingReports(req, res)
);

export default router;
