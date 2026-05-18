export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { messages, system } = req.body;
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: system + ' IMPORTANTE: Rispondi SEMPRE e SOLO in italiano. Cita sempre gli articoli di legge aggiornati e le circolari dell Agenzia delle Entrate più recenti. Se non sei sicuro della normativa aggiornata, dillo esplicitamente.',
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
          }
        ],
        messages,
      }),
    });
    const data = await response.json();
    const textContent = data.content?.find(c => c.type === 'text');
    res.status(200).json({
      content: [{ type: 'text', text: textContent?.text || 'Nessuna risposta disponibile.' }]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
