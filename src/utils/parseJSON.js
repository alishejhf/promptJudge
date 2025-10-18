export function parseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1]);
      } catch (e2) {
      }
    }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      } catch (e3) {
        
      }
    }

    throw new Error('Unable to parse JSON from response');
  }
}

export function validateEvaluationResult(result) {
  const required = ['clarity', 'specificity', 'scope', 'context', 'constraints', 'bias', 'feedback', 'improved_prompt'];
  const missing = required.filter(field => !(field in result));
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Validate numeric fields
  const numericFields = ['clarity', 'specificity', 'scope', 'context', 'constraints'];
  for (const field of numericFields) {
    if (typeof result[field] !== 'number' || result[field] < 0 || result[field] > 10) {
      throw new Error(`Field ${field} must be a number between 0 and 10`);
    }
  }

  return true;
}
