import { Router } from 'express';
import { constructionCompanyController } from '../controllers/ConstructionCompanyController.js';
import { canCreateCompanies, canReadCompanies, ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/', ensureAuthenticated, canReadCompanies, (req, res, next) =>
  constructionCompanyController.findAll(req, res, next)
);
router.get('/active', ensureAuthenticated, canReadCompanies, (req, res, next) =>
  constructionCompanyController.getActive(req, res, next)
);
router.get('/:id', ensureAuthenticated, canReadCompanies, (req, res, next) =>
  constructionCompanyController.findById(req, res, next)
);
router.post('/', ensureAuthenticated, canCreateCompanies, (req, res, next) =>
  constructionCompanyController.create(req, res, next)
);

export default router;
