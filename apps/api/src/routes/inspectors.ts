import { Router } from 'express';
import { inspectorController } from '../controllers/InspectorController.js';
import {
  canCreateInspectors,
  canReadInspectors,
  canUpdateInspectors,
  ensureAuthenticated,
} from '../middleware/auth.js';

const router = Router();

router.get('/', ensureAuthenticated, canReadInspectors, (req, res, next) =>
  inspectorController.findAll(req, res, next)
);
router.get('/:id', ensureAuthenticated, canReadInspectors, (req, res, next) =>
  inspectorController.findById(req, res, next)
);
router.post('/', ensureAuthenticated, canCreateInspectors, (req, res, next) =>
  inspectorController.create(req, res, next)
);
router.put('/:id', ensureAuthenticated, canUpdateInspectors, (req, res, next) =>
  inspectorController.update(req, res, next)
);

export default router;
