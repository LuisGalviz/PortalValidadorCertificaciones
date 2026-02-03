import { Router } from 'express';
import { authController } from '../controllers/AuthController.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/me', ensureAuthenticated, (req, res, next) => authController.getMe(req, res, next));
router.post('/logout', ensureAuthenticated, (req, res, next) =>
  authController.logout(req, res, next)
);

export default router;
