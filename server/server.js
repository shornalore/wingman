const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import Groq SDK
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Simple dev server with actual LLM integration
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (pathname === '/api/ask' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const { text, mode, thread = [] } = JSON.parse(body);
        
        if (!text || text.length > 600) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid text' }));
          return;
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

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        console.error('API Error:', error);
        
        // Fallback response for development
        const fallbackResponses = {
          define: `"${text}" refers to a concept or term that requires clarification. In most contexts, this would be defined based on the surrounding content and usage patterns.`,
          explain: `Let me explain "${text}" in simple terms. This appears to be a key concept that benefits from contextual understanding.`
        };
        
        const fallbackAnswer = fallbackResponses[mode] || fallbackResponses.explain;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.json({ answer: fallbackAnswer, tokens: 0 });
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  if (process.env.NODE_ENV === 'production') {
    console.log(`Production server running on port ${PORT}`);
  } else {
    console.log(`Development server running on http://localhost:${PORT}`);
  }
  console.log(`API endpoint: /api/ask`);
});
