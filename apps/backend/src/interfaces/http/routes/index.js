const express = require('express');
const router = express.Router();

const EscaladorRoutes = require('./escaladores.routes');

// Monta las rutas de escaladores bajo el prefijo /escaladores
router.use('/escaladores', EscaladorRoutes);

module.exports = router;
