import express from 'express';
import { comparePrompts } from '../services/ollamaService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { promptA, promptB } = req.body;

    if (!promptA || typeof promptA !== 'string' || promptA.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'promptA is required and must be a non-empty string'
      });
    }

    if (!promptB || typeof promptB !== 'string' || promptB.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'promptB is required and must be a non-empty string'
      });
    }

    console.log(`[Compare] Comparing prompts...`);

    const result = await comparePrompts(promptA, promptB);

    console.log('[Compare] Comparison successful');

    res.json(result);
  } catch (error) {
    console.error('[Compare] Error:', error);
    res.status(500).json({
      error: 'Comparison failed',
      message: error.message
    });
  }
});

export default router;
