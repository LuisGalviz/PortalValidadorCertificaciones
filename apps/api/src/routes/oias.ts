import { Router } from 'express';
import multer from 'multer';
import { oiaController } from '../controllers/OiaController.js';
import {
  canCreateOias,
  canReadOias,
  canReadOwnOia,
  canUpdateOias,
  canUpdateOwnOia,
  ensureAuthenticated,
} from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/me', ensureAuthenticated, canReadOwnOia, (req, res) =>
  oiaController.findOwn(req, res)
);
router.put(
  '/me',
  ensureAuthenticated,
  canUpdateOwnOia,
  upload.fields([
    { name: 'fileOnac', maxCount: 1 },
    { name: 'fileCRT', maxCount: 1 },
  ]),
  (req, res) => oiaController.updateOwn(req, res)
);

router.get('/', ensureAuthenticated, canReadOias, (req, res) => oiaController.findAll(req, res));
router.get('/:id', ensureAuthenticated, canReadOias, (req, res) =>
  oiaController.findById(req, res)
);
router.post('/', ensureAuthenticated, canCreateOias, (req, res) => oiaController.create(req, res));
router.put('/:id', ensureAuthenticated, canUpdateOias, (req, res) =>
  oiaController.update(req, res)
);
router.get('/:id/users', ensureAuthenticated, canReadOias, (req, res) =>
  oiaController.getUsers(req, res)
);

export default router;
