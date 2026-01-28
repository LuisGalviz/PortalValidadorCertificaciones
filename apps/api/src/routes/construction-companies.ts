import { Router } from 'express';
import { constructionCompanyController } from '../controllers/ConstructionCompanyController.js';
import { ensureAuthenticated, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', ensureAuthenticated, (req, res) =>
  constructionCompanyController.findAll(req, res)
);
router.get('/active', ensureAuthenticated, (req, res) =>
  constructionCompanyController.getActive(req, res)
);
router.get('/:id', ensureAuthenticated, (req, res) =>
  constructionCompanyController.findById(req, res)
);
router.post('/', ensureAuthenticated, requireAdmin, (req, res) =>
  constructionCompanyController.create(req, res)
);

export default router;
