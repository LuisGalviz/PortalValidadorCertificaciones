import { Router } from 'express';
import { catalogController } from '../controllers/CatalogController.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/type-organisms', ensureAuthenticated, (req, res) =>
  catalogController.getTypeOrganisms(req, res)
);
router.get('/inspection-types', ensureAuthenticated, (req, res) =>
  catalogController.getInspectionTypes(req, res)
);
router.get('/causals', ensureAuthenticated, (req, res) => catalogController.getCausals(req, res));
router.get('/checklist/:inspectionType', ensureAuthenticated, (req, res) =>
  catalogController.getCheckList(req, res)
);

export default router;
