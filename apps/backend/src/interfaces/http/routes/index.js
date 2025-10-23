const express = require('express');
const router = express.Router();

const EscaladorRoutes = require('./escaladores.routes');
const PistaRoutes = require('./pistas.routes');
// Monta las rutas de escaladores bajo el prefijo /escaladores
router.use('/escaladores', EscaladorRoutes);
router.use('/pistas', PistaRoutes);

module.exports = router;
