import { Router } from 'express';
import * as ctrl from '../controllers/viajes.controller.js';
import { idRules, listViajesRules, createViajeRules, updateViajeRules } from '../validators/viajes.validators.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', listViajesRules, validate, ctrl.getAll);
router.get('/:id', idRules, validate, ctrl.getOne);
router.post('/', createViajeRules, validate, ctrl.create);
router.put('/:id', updateViajeRules, validate, ctrl.update);
router.delete('/:id', idRules, validate, ctrl.remove);

export default router;
