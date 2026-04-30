/**
 * Pranvix — API Route
 * All messages go to Groq (Llama 3)
 */
const https = require('https');

module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: { message: 'GROQ_API_KEY not set in Vercel Environment Variables.' }});

  const { system, messages } = req.body;

  const payload = JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: system },
      ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
    ],
    max_tokens: 1000,
    temperature: 0.7
  });

  try {
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.groq.com',
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(payload)
        }
      };
      const req = https.request(options, r => {
        let body = '';
        r.on('data', c => body += c);
        r.on('end', () => { try { resolve({ status: r.statusCode, body: JSON.parse(body) }); } catch { resolve({ status: r.statusCode, body }); } });
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    if (result.status !== 200 || result.body.error) {
      const raw = result.body.error?.message || '';
      const friendly =
        result.status === 429 || raw.includes('rate_limit') || raw.includes('Rate limit')
          ? '⚠️ Too many requests right now. Please wait a few seconds and try again.'
          : result.status === 401 || raw.includes('invalid_api_key') || raw.includes('auth')
          ? '🔑 API key error. Please contact the admin.'
          : result.status === 503 || raw.includes('unavailable') || raw.includes('overloaded')
          ? '🛠️ AI service is temporarily unavailable. Please try again in a moment.'
          : result.status === 400
          ? '❌ Invalid request. Try rephrasing your message.'
          : '❌ Something went wrong. Please try again.';
      return res.status(result.status || 500).json({ error: { message: friendly }});
    }

    const reply = result.body.choices?.[0]?.message?.content || 'No response.';
    return res.status(200).json({
      content: [{ text: reply }],
      usage: {
        input_tokens: result.body.usage?.prompt_tokens || 0,
        output_tokens: result.body.usage?.completion_tokens || 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
};
