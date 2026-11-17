import express from 'express';
import { getRecommendation } from '../controllers/commuteController.js';
import { validateCoordinates } from '../middleware/validateCoordinates.js';

const router = express.Router();

router.get('/recommendation', validateCoordinates, getRecommendation);

export default router;
