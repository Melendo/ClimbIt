const express = require('express');
const router = express.Router();

const { escaladorController } = require('../../../infrastructure/container');

router.post('/', (req, res, next) => {
  escaladorController.crear(req, res, next);
});

module.exports = router;
