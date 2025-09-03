import express from 'express';
import { getWorkstation } from '../controllers/workstationController.js';

const router = express.Router();

router.get('/:id', getWorkstation);

export default router;