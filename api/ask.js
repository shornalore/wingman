import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  // 1. Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Validate body
  const { text, mode = 'explain' } = req.body ?? {};
  if (!text || text.length > 600) {
    return res.status(400).json({ error: 'Invalid text' });
  }

  try {
    // 3. Build prompt
    const prompt =
      mode === 'define'
        ? `Define "${text}" in one sentence and give 2 short examples.`
        : `Answer concisely (≤ 60 words): ${text}`;

    // 4. Call Groq
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 120,
      temperature: 0,
    });

    const answer = completion.choices[0]?.message?.content?.trim() || 'No response available';
    const result = { answer, tokens: completion.usage?.total_tokens || 0 };

    return res.json(result);
  } catch (error) {
    console.error('API Error:', error);
    
    // Return actual error for debugging
    return res.status(500).json({ 
      error: 'API Error',
      message: error.message,
      type: error.type || 'unknown'
    });
  }
}
