const express = require('express');
const { crearPista } = require('../controllers/pistaController');
const router = express.Router();

router.post('/', crearPista);

module.exports = router;
