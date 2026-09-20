import { HtmlConverterEngine } from '../converter.js';

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
    const { html, builder = 'elementor', title = 'Converted Theme Template' } = req.body;

    if (!html || typeof html !== 'string' || html.trim().length === 0) {
      return res.status(400).json({ error: 'HTML content is required.' });
    }

    const template = HtmlConverterEngine.convert(html, builder, { title });

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
