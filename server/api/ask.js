import { kv } from '@vercel/kv';

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

    // Mock responses for demo
    const responses = {
      define: `"${text}" refers to a concept or term that requires clarification. In most contexts, this would be defined based on the surrounding content and usage patterns.`,
      explain: `Let me explain "${text}" in simple terms. This appears to be a key concept that benefits from contextual understanding. The explanation would typically include examples and practical applications.`
    };

    const answer = responses[mode] || responses.explain;

    res.json({ answer });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
