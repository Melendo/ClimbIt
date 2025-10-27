import express from 'express';
const router = express.Router();

import EscaladorRoutes from './escaladoresRoutes.js';
import PistaRoutes from './pistasRoutes.js';

router.use('/escaladores', EscaladorRoutes);
router.use('/pistas', PistaRoutes);

export default router;
