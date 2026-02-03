import { Router } from 'express';
import { reportController } from '../controllers/ReportController.js';
import {
  canCreateReports,
  canReadReports,
  canReviewReports,
  ensureAuthenticated,
} from '../middleware/auth.js';

const router = Router();

router.get('/', ensureAuthenticated, canReadReports, (req, res, next) =>
  reportController.findAll(req, res, next)
);
router.get('/independent', ensureAuthenticated, canReadReports, (req, res, next) =>
  reportController.getIndependent(req, res, next)
);
router.get('/:id', ensureAuthenticated, canReadReports, (req, res, next) =>
  reportController.findById(req, res, next)
);
router.post('/', ensureAuthenticated, canCreateReports, (req, res, next) =>
  reportController.create(req, res, next)
);
router.post('/:id/review', ensureAuthenticated, canReviewReports, (req, res, next) =>
  reportController.review(req, res, next)
);

export default router;
