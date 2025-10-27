const express = require('express');
const router = express.Router();

const { pistaController } = require('../../../infrastructure/container');

router.post('/', (req, res, next) => {
  pistaController.crear(req, res, next);
});

module.exports = router;
