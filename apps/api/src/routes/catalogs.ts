import { Router } from 'express';
import { catalogController } from '../controllers/CatalogController.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/type-organisms', ensureAuthenticated, (req, res, next) =>
  catalogController.getTypeOrganisms(req, res, next)
);
router.get('/inspection-types', ensureAuthenticated, (req, res, next) =>
  catalogController.getInspectionTypes(req, res, next)
);
router.get('/causals', ensureAuthenticated, (req, res, next) =>
  catalogController.getCausals(req, res, next)
);
router.get('/checklist/:inspectionType', ensureAuthenticated, (req, res, next) =>
  catalogController.getCheckList(req, res, next)
);

export default router;
