import { kv } from '@vercel/kv';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, mode } = req.body;
    
    if (!text || text.length > 600) {
      return res.status(400).json({ error: 'Invalid text' });
    }

    const prompt = mode === 'define' 
      ? `Define "${text}" in one sentence and give 2 short examples.`
      : `Answer concisely (≤ 60 words): ${text}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 120,
      temperature: 0,
    });

    const answer = completion.choices[0]?.message?.content?.trim() || 'No response';
    
    res.status(200).json({ 
      answer,
      tokens: completion.usage?.total_tokens || 0
    });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
