import { Router } from 'express';
import * as ctrl from '../controllers/conductores.controller.js';
import { idRules, createConductorRules, updateConductorRules } from '../validators/conductores.validators.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', ctrl.getAll);
router.get('/:id', idRules, validate, ctrl.getOne);
router.get('/:id/viajes', idRules, validate, ctrl.getViajes);
router.get('/:id/kilometros', idRules, validate, ctrl.getKilometros);
router.post('/', createConductorRules, validate, ctrl.create);
router.put('/:id', updateConductorRules, validate, ctrl.update);
router.delete('/:id', idRules, validate, ctrl.remove);

export default router;
