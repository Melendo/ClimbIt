import express from 'express';
import containerPromise from '../../../infrastructure/container.js';

const router = express.Router();
const container = await containerPromise;
const { pistaController } = container;

router.post('/', (req, res, next) => {
  pistaController.crear(req, res, next);
});

export default router;
