import express from 'express';
const router = express.Router();

import EscaladorRoutes from './escaladoresRoutes.js';
import PistaRoutes from './pistasRoutes.js';
import ZonaRoutes from './zonasRoutes.js';

router.use('/escaladores', EscaladorRoutes);
router.use('/pistas', PistaRoutes);
router.use('/zonas', ZonaRoutes);

export default router;
