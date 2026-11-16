import { Router } from 'express';
import * as ctrl from '../controllers/vehiculos.controller.js';
import { idRules, createVehiculoRules, updateVehiculoRules } from '../validators/vehiculos.validators.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth); // todas las rutas protegidas

router.get('/', ctrl.getAll);
router.get('/:id', idRules, validate, ctrl.getOne);
router.get('/:id/viajes', idRules, validate, ctrl.getViajes);
router.get('/:id/kilometros', idRules, validate, ctrl.getKilometros);
router.post('/', createVehiculoRules, validate, ctrl.create);
router.put('/:id', updateVehiculoRules, validate, ctrl.update);
router.delete('/:id', idRules, validate, ctrl.remove);

export default router;
