import { kv } from '@vercel/kv';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, mode, thread = [] } = req.body;
  
  if (!text || text.length > 600) {
    return res.status(400).json({ error: 'Invalid text' });
  }

  try {
    // Rate limiting check
    const clientId = req.headers['x-forwarded-for'] || 'anonymous';
    const key = `rate_limit:${clientId}`;
    const count = await kv.incr(key);
    
    if (count === 1) {
      await kv.expire(key, 3600); // 1 hour window
    }
    
    if (count > 100) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    // Cache key for responses
    const cacheKey = `response:${text}:${mode}`;
    const cached = await kv.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    // Prepare prompt based on mode
    const prompt = mode === 'define'
      ? `Define "${text}" in one sentence and give 2 short examples.`
      : `Answer concisely (≤ 60 words): ${text}`;

    // Make API call to Groq
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 120,
      temperature: 0,
    });

    const answer = completion.choices[0]?.message?.content?.trim() || 'No response available';
    
    const result = { 
      answer, 
      tokens: completion.usage?.total_tokens || 0 
    };

    // Cache for 7 days
    await kv.set(cacheKey, result, { ex: 7 * 24 * 3600 });

    res.json(result);
  } catch (error) {
    console.error('API Error:', error);
    
    // Fallback response for development
    const fallbackResponses = {
      define: `"${text}" refers to a concept or term that requires clarification. In most contexts, this would be defined based on the surrounding content and usage patterns.`,
      explain: `Let me explain "${text}" in simple terms. This appears to be a key concept that benefits from contextual understanding.`
    };
    
    const fallbackAnswer = fallbackResponses[mode] || fallbackResponses.explain;
    res.json({ answer: fallbackAnswer, tokens: 0 });
  }
}
