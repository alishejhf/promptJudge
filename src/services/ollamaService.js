import { parseJSON, validateEvaluationResult } from '../utils/parseJSON.js';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';
const OLLAMA_FALLBACK_MODEL = process.env.OLLAMA_FALLBACK_MODEL || 'llama3.1:8b';
const OLLAMA_TEMPERATURE = parseFloat(process.env.OLLAMA_TEMPERATURE || '0.3');

const SYSTEM_PROMPT = `You are PromptJudge, an AI that evaluates the quality of user prompts for LLMs.
Output ONLY valid JSON with these exact keys:
- clarity (number 0-10): How clear and unambiguous is the prompt?
- specificity (number 0-10): How specific and detailed is the request?
- scope (number 0-10): How well-defined is the scope?
- context (number 0-10): How much relevant context is provided?
- constraints (number 0-10): Are constraints or requirements specified?
- bias (string): Potential bias level (low/medium/high)
- feedback (string): Brief feedback on the prompt quality
- improved_prompt (string): An improved version of the prompt

Return ONLY the JSON object, no other text.`;

async function callOllama(prompt, model = OLLAMA_MODEL, temperature = OLLAMA_TEMPERATURE) {
  const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      stream: false,
      temperature: temperature,
      options: {
        temperature: temperature,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.response;
}

export async function evaluatePrompt(promptText, retryCount = 0) {
  const fullPrompt = `${SYSTEM_PROMPT}\n\nEvaluate this prompt:\n"${promptText}"`;
  
  const currentModel = retryCount > 0 ? OLLAMA_FALLBACK_MODEL : OLLAMA_MODEL;
  
  try {
    console.log(`[OllamaService] Evaluating prompt with model: ${currentModel} (attempt ${retryCount + 1})`);
    
    const response = await callOllama(fullPrompt, currentModel);
    
    console.log(`[OllamaService] Raw response: ${response.substring(0, 200)}...`);
    
    const parsed = parseJSON(response);
    validateEvaluationResult(parsed);
    
    return parsed;
  } catch (error) {
    console.error(`[OllamaService] Attempt ${retryCount + 1} failed:`, error.message);

    if (retryCount === 0) {
      console.log('[OllamaService] Retrying with stricter instruction...');
      const stricterPrompt = `${SYSTEM_PROMPT}\n\nIMPORTANT: Respond with ONLY a JSON object, no explanations or markdown.\n\nEvaluate this prompt:\n"${promptText}"`;
      
      try {
        const response = await callOllama(stricterPrompt, currentModel);
        const parsed = parseJSON(response);
        validateEvaluationResult(parsed);
        return parsed;
      } catch (retryError) {
        console.error('[OllamaService] Retry failed:', retryError.message);
        throw new Error(`Failed to get valid evaluation after retry: ${retryError.message}`);
      }
    }
    
    throw error;
  }
}

export async function comparePrompts(promptA, promptB) {
  const comparePrompt = `${SYSTEM_PROMPT}

Now compare these two prompts and determine which is better quality.

Prompt A: "${promptA}"
Prompt B: "${promptB}"

Output ONLY valid JSON with these keys:
- winner (string): "A" or "B" or "tie"
- reason (string): Brief explanation of why
- scores (object): Contains "A" and "B" objects, each with clarity and specificity scores (0-10)

Return ONLY the JSON object, no other text.`;

  try {
    console.log('[OllamaService] Comparing two prompts...');
    
    const response = await callOllama(comparePrompt);
    const parsed = parseJSON(response);
    
    // Validate comparison result
    if (!parsed.winner || !parsed.reason || !parsed.scores) {
      throw new Error('Invalid comparison result format');
    }
    
    return parsed;
  } catch (error) {
    console.error('[OllamaService] Comparison failed:', error.message);
    
    // Retry once
    try {
      console.log('[OllamaService] Retrying comparison with fallback model...');
      const response = await callOllama(comparePrompt, OLLAMA_FALLBACK_MODEL);
      const parsed = parseJSON(response);
      
      if (!parsed.winner || !parsed.reason || !parsed.scores) {
        throw new Error('Invalid comparison result format');
      }
      
      return parsed;
    } catch (retryError) {
      throw new Error(`Failed to compare prompts: ${retryError.message}`);
    }
  }
}
