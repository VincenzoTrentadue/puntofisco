export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, system } = req.body;

    const systemPrompt = system + `

ISTRUZIONI OPERATIVE FONDAMENTALI:
1. Rispondi SEMPRE e SOLO in italiano, qualunque sia la lingua della domanda.
2. Prima di rispondere, cerca SEMPRE su internet le informazioni aggiornate usando lo strumento di ricerca web.
3. Cerca su questi siti ufficiali in ordine di priorità:
   - normattiva.it (testo vigente delle leggi)
   - agenziaentrate.gov.it (circolari, risoluzioni, interpelli)
   - gazzettaufficiale.it (decreti e leggi recenti)
   - fiscooggi.it (aggiornamenti fiscali)
   - ilsole24ore.com/fisco (notizie fiscali aggiornate)
4. Cita SEMPRE la fonte normativa: articolo di legge, circolare, risoluzione o decreto con data.
5. Se una norma è stata modificata di recente, indica la versione aggiornata e la data di modifica.
6. Struttura la risposta in modo chiaro:
   - Prima la risposta diretta e pratica
   - Poi il riferimento normativo aggiornato
   - Infine eventuali avvertenze o casi particolari
7. Se non trovi informazioni aggiornate, dillo esplicitamente e indica la normativa che conosci con la data di riferimento.
8. Non inventare mai riferimenti normativi — se non sei sicuro, dillo.
9. Per domande su agevolazioni e bandi, verifica sempre le scadenze attuali.
10. Usa un linguaggio professionale ma comprensibile, senza tecnicismi inutili.`;

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
        system: systemPrompt,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 3,
          }
        ],
        messages,
      }),
    });

    const data = await response.json();

    // Estrai solo il testo finale dalla risposta
    let finalText = '';
    if (data.content && Array.isArray(data.content)) {
      const textBlocks = data.content.filter(c => c.type === 'text');
      finalText = textBlocks.map(c => c.text).join('\n');
    }

    if (!finalText) {
      finalText = 'Non sono riuscito a elaborare una risposta. Riprova.';
    }

    res.status(200).json({
      content: [{ type: 'text', text: finalText }]
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
