import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller.js';
import { registerRules, loginRules } from '../validators/auth.validators.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.get('/me', requireAuth, me);

export default router;
