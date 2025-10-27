import express from 'express';
import containerPromise from '../../../infrastructure/container.js';

const router = express.Router();
const container = await containerPromise;
const { escaladorController } = container;

router.post('/create', (req, res, next) => {
  escaladorController.crear(req, res, next);
});

export default router;
