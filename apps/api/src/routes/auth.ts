import { Router } from 'express';
import { authController } from '../controllers/AuthController.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/me', ensureAuthenticated, (req, res) => authController.getMe(req, res));
router.post('/logout', ensureAuthenticated, (req, res) => authController.logout(req, res));

export default router;
