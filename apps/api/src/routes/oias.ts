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

router.get('/me', ensureAuthenticated, canReadOwnOia, (req, res, next) =>
  oiaController.findOwn(req, res, next)
);
router.put(
  '/me',
  ensureAuthenticated,
  canUpdateOwnOia,
  upload.fields([
    { name: 'fileOnac', maxCount: 1 },
    { name: 'fileCRT', maxCount: 1 },
  ]),
  (req, res, next) => oiaController.updateOwn(req, res, next)
);

router.get('/', ensureAuthenticated, canReadOias, (req, res, next) =>
  oiaController.findAll(req, res, next)
);
router.get('/:id', ensureAuthenticated, canReadOias, (req, res, next) =>
  oiaController.findById(req, res, next)
);
router.post(
  '/',
  ensureAuthenticated,
  canCreateOias,
  upload.fields([
    { name: 'fileOnac', maxCount: 1 },
    { name: 'fileCRT', maxCount: 1 },
    { name: 'fileExistenceCertificate', maxCount: 1 },
  ]),
  (req, res, next) => oiaController.create(req, res, next)
);
router.put('/:id', ensureAuthenticated, canUpdateOias, (req, res, next) =>
  oiaController.update(req, res, next)
);
router.get('/:id/users', ensureAuthenticated, canReadOias, (req, res, next) =>
  oiaController.getUsers(req, res, next)
);

export default router;
