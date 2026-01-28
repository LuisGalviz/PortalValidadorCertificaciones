import { Router } from 'express';
import { oiaController } from '../controllers/OiaController.js';
import { ensureAuthenticated, requireAdmin, requireAdminOrStrategy } from '../middleware/auth.js';

const router = Router();

router.get('/', ensureAuthenticated, requireAdminOrStrategy, (req, res) =>
  oiaController.findAll(req, res)
);
router.get('/:id', ensureAuthenticated, requireAdminOrStrategy, (req, res) =>
  oiaController.findById(req, res)
);
router.post('/', ensureAuthenticated, requireAdmin, (req, res) => oiaController.create(req, res));
router.put('/:id', ensureAuthenticated, requireAdmin, (req, res) => oiaController.update(req, res));
router.get('/:id/users', ensureAuthenticated, requireAdminOrStrategy, (req, res) =>
  oiaController.getUsers(req, res)
);

export default router;
