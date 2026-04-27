/**
 * Pranvix V3 — Smart API Router
 * Text only     → Groq  (Llama 3, fast & free)
 * Image attached→ Gemini 1.5 Flash Vision
 * PDF text      → Groq  (text extracted client-side by PDF.js)
 */
const https = require('https');

function callGroq(systemPrompt, messages, apiKey) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
      ],
      max_tokens: 1000, temperature: 0.7
    });
    const options = {
      hostname: 'api.groq.com', path: '/openai/v1/chat/completions', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'Content-Length': Buffer.byteLength(payload) }
    };
    const req = https.request(options, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(body) }); } catch { resolve({ status: res.statusCode, body }); } });
    });
    req.on('error', reject); req.write(payload); req.end();
  });
}

function callGeminiVision(systemPrompt, userText, imageBase64, mimeType, history, apiKey) {
  return new Promise((resolve, reject) => {
    const geminiHistory = history.slice(-6).map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    const currentParts = [];
    if (userText) currentParts.push({ text: userText });
    currentParts.push({ inline_data: { mime_type: mimeType, data: imageBase64 } });
    const payload = JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [...geminiHistory, { role: 'user', parts: currentParts }],
      generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
    });
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    };
    const req = https.request(options, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(body) }); } catch { resolve({ status: res.statusCode, body }); } });
    });
    req.on('error', reject); req.write(payload); req.end();
  });
}

module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const groqKey   = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const { system, messages, imageBase64, imageMimeType } = req.body;

  try {
    if (imageBase64 && imageMimeType) {
      if (!geminiKey) return res.status(500).json({ error: { message: 'GEMINI_API_KEY not set in Vercel.' }});
      const lastMsg = messages[messages.length - 1]?.content || '';
      const history = messages.slice(0, -1);
      const result  = await callGeminiVision(system, lastMsg, imageBase64, imageMimeType, history, geminiKey);
      if (result.status !== 200 || result.body.error)
        return res.status(result.status || 500).json({ error: { message: result.body.error?.message || 'Gemini error' }});
      const reply = result.body.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
      return res.status(200).json({ content: [{ text: reply }], usage: { input_tokens: 0, output_tokens: 0 }, model: 'gemini-1.5-flash' });
    }

    if (!groqKey) return res.status(500).json({ error: { message: 'GROQ_API_KEY not set in Vercel.' }});
    const result = await callGroq(system, messages, groqKey);
    if (result.status !== 200 || result.body.error)
      return res.status(result.status || 500).json({ error: { message: result.body.error?.message || 'Groq error' }});
    const reply = result.body.choices?.[0]?.message?.content || 'No response.';
    return res.status(200).json({
      content: [{ text: reply }],
      usage: { input_tokens: result.body.usage?.prompt_tokens || 0, output_tokens: result.body.usage?.completion_tokens || 0 },
      model: 'llama-3.1-8b-instant'
    });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
};
