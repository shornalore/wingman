// api/ask.js
import { kv } from '@vercel/kv';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  // 1. Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Validate body
  const { text, mode = 'explain', thread = [] } = req.body ?? {};
  if (!text || text.length > 600) {
    return res.status(400).json({ error: 'Invalid text' });
  }

  try {
    // 3. Rate-limit by IP
    const clientId = req.headers['x-forwarded-for']?.split(',')[0] || 'anonymous';
    const key = `rate_limit:${clientId}`;
    const count = await kv.incr(key);
    if (count === 1) await kv.expire(key, 3600); // 1 h window
    if (count > 100) return res.status(429).json({ error: 'Rate limit exceeded' });

    // 4. Cached response?
    const cacheKey = `response:${text}:${mode}`;
    const cached = await kv.get(cacheKey);
    if (cached) return res.json(cached);

    // 5. Build prompt
    const prompt =
      mode === 'define'
        ? `Define "${text}" in one sentence and give 2 short examples.`
        : `Answer concisely (≤ 60 words): ${text}`;

    // 6. Call Groq
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 120,
      temperature: 0,
    });

    const answer = completion.choices[0]?.message?.content?.trim() || 'No response available';
    const result = { answer, tokens: completion.usage?.total_tokens || 0 };

    // 7. Cache for 7 days
    await kv.set(cacheKey, result, { ex: 7 * 24 * 3600 });

    return res.json(result);
  } catch (error) {
    console.error('API Error:', error);

    // 8. Safe fallback
    const fallbackResponses = {
      define: `"${text}" refers to a concept or term that requires clarification. In most contexts, this would be defined based on the surrounding content and usage patterns.`,
      explain: `Let me explain "${text}" in simple terms. This appears to be a key concept that benefits from contextual understanding.`,
    };
    return res.json({ answer: fallbackResponses[mode] || fallbackResponses.explain, tokens: 0 });
  }
}