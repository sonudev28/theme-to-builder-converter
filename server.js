import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { HtmlConverterEngine } from './converter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api', (req, res) => {
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
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
