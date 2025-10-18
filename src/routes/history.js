import express from 'express'
import { evaluationHistory } from './evaluate.js';

const router = express.Router();

router.get('/', (req, res) => {
  console.log(`[History] Retrieving ${evaluationHistory.length} evaluation(s)`);
  res.json({
    count: evaluationHistory.length,
    history: evaluationHistory
  });
});

export default router;