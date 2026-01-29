import { Router } from 'express';
import { reportController } from '../controllers/ReportController.js';
import {
  canCreateReports,
  canReadReports,
  canReviewReports,
  ensureAuthenticated,
} from '../middleware/auth.js';

const router = Router();

router.get('/', ensureAuthenticated, canReadReports, (req, res) =>
  reportController.findAll(req, res)
);
router.get('/independent', ensureAuthenticated, canReadReports, (req, res) =>
  reportController.getIndependent(req, res)
);
router.get('/:id', ensureAuthenticated, canReadReports, (req, res) =>
  reportController.findById(req, res)
);
router.post('/', ensureAuthenticated, canCreateReports, (req, res) =>
  reportController.create(req, res)
);
router.post('/:id/review', ensureAuthenticated, canReviewReports, (req, res) =>
  reportController.review(req, res)
);

export default router;
