import { Router } from 'express';
import { constructionCompanyController } from '../controllers/ConstructionCompanyController.js';
import { canCreateCompanies, canReadCompanies, ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/', ensureAuthenticated, canReadCompanies, (req, res) =>
  constructionCompanyController.findAll(req, res)
);
router.get('/active', ensureAuthenticated, canReadCompanies, (req, res) =>
  constructionCompanyController.getActive(req, res)
);
router.get('/:id', ensureAuthenticated, canReadCompanies, (req, res) =>
  constructionCompanyController.findById(req, res)
);
router.post('/', ensureAuthenticated, canCreateCompanies, (req, res) =>
  constructionCompanyController.create(req, res)
);

export default router;
