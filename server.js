import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { CleanConverterEngine } from './converter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api', async (req, res) => {
  try {
    const { html, url, builder = 'elementor', title = 'Converted Theme Template' } = req.body;

    let targetHtml = html;

    if (url && typeof url === 'string' && url.startsWith('http')) {
      console.log('[Local Server] Processing Live URL scan:', url);
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
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
