import { Router } from 'express';
import { inspectorController } from '../controllers/InspectorController.js';
import { ensureAuthenticated, requireAdminOrOia } from '../middleware/auth.js';

const router = Router();

router.get('/', ensureAuthenticated, (req, res) => inspectorController.findAll(req, res));
router.get('/:id', ensureAuthenticated, (req, res) => inspectorController.findById(req, res));
router.post('/', ensureAuthenticated, requireAdminOrOia, (req, res) =>
  inspectorController.create(req, res)
);
router.put('/:id', ensureAuthenticated, requireAdminOrOia, (req, res) =>
  inspectorController.update(req, res)
);

export default router;
