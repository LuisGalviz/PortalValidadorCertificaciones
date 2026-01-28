import { Router } from 'express';
import { catalogController } from '../controllers/CatalogController.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/inspection-types', ensureAuthenticated, (req, res) =>
  catalogController.getInspectionTypes(req, res)
);
router.get('/causals', ensureAuthenticated, (req, res) => catalogController.getCausals(req, res));

export default router;
