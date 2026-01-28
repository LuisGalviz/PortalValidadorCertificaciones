import { Router } from 'express';
import { reportController } from '../controllers/ReportController.js';
import { ensureAuthenticated, requireAdminOrOia } from '../middleware/auth.js';

const router = Router();

router.get('/', ensureAuthenticated, (req, res) => reportController.findAll(req, res));
router.get('/independent', ensureAuthenticated, (req, res) =>
  reportController.getIndependent(req, res)
);
router.get('/:id', ensureAuthenticated, (req, res) => reportController.findById(req, res));
router.post('/', ensureAuthenticated, requireAdminOrOia, (req, res) =>
  reportController.create(req, res)
);
router.post('/:id/review', ensureAuthenticated, (req, res) => reportController.review(req, res));

export default router;
