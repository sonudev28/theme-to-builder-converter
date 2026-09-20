import { CleanConverterEngine } from '../converter.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { html, url, builder = 'elementor', title = 'Converted Theme Template' } = req.body;

    let targetHtml = html;

    if (url && typeof url === 'string' && url.startsWith('http')) {
      console.log('[API] Processing Live URL scan:', url);
      targetHtml = await CleanConverterEngine.fetchAndConsolidate(url);
    }

    if (!targetHtml || typeof targetHtml !== 'string' || targetHtml.trim().length === 0) {
      return res.status(400).json({ error: 'HTML content or a valid URL is required.' });
    }

    const template = CleanConverterEngine.convert(targetHtml, builder, { title });

    return res.status(200).json({
      success: true,
      builder,
      template
    });
  } catch (err) {
    console.error('Conversion Error:', err);
    return res.status(500).json({
      error: 'Failed to convert template.',
      details: err.message
    });
  }
}
