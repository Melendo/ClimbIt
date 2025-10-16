const express = require('express');
const { crearEscalador } = require('../controllers/escaladorController');
const router = express.Router();

router.post('/', crearEscalador);

module.exports = router;
