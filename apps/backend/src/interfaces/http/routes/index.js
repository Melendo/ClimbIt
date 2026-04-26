import express from 'express';
const router = express.Router();

import EscaladorRoutes from './escaladoresRoutes.js';
import PistaRoutes from './pistasRoutes.js';
import ZonaRoutes from './zonasRoutes.js';
import RocodromoRoutes from './rocodromosRoutes.js';
import AmistadesRoutes from './amistadesRoutes.js';

router.use('/escaladores', EscaladorRoutes);
router.use('/pistas', PistaRoutes);
router.use('/zonas', ZonaRoutes);
router.use('/rocodromos', RocodromoRoutes);
router.use('/amistades', AmistadesRoutes);

export default router;
