import { Router } from 'express';
import { inspectorController } from '../controllers/InspectorController.js';
import {
  canCreateInspectors,
  canReadInspectors,
  canUpdateInspectors,
  ensureAuthenticated,
} from '../middleware/auth.js';

const router = Router();

router.get('/', ensureAuthenticated, canReadInspectors, (req, res) =>
  inspectorController.findAll(req, res)
);
router.get('/:id', ensureAuthenticated, canReadInspectors, (req, res) =>
  inspectorController.findById(req, res)
);
router.post('/', ensureAuthenticated, canCreateInspectors, (req, res) =>
  inspectorController.create(req, res)
);
router.put('/:id', ensureAuthenticated, canUpdateInspectors, (req, res) =>
  inspectorController.update(req, res)
);

export default router;
