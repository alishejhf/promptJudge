import express from 'express';
import { evaluatePrompt } from '../services/ollamaService.js';

const router = express.Router();

export const evaluationHistory = [];

router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;

    // Validate input
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Prompt is required and must be a non-empty string'
      });
    }

    console.log(`[Evaluate] Evaluating prompt: "${prompt.substring(0, 50)}..."`);

    // Call Ollama service
    const result = await evaluatePrompt(prompt);

    // Store in history (keep only last 5)
    evaluationHistory.unshift({
      prompt,
      result,
      timestamp: new Date().toISOString()
    });

    if (evaluationHistory.length > 5) {
      evaluationHistory.pop();
    }

    console.log('[Evaluate] Evaluation successful');

    res.json(result);
  } catch (error) {
    console.error('[Evaluate] Error:', error);
    res.status(500).json({
      error: 'Evaluation failed',
      message: error.message
    });
  }
});

export default router;
