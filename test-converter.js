import { HtmlConverterEngine } from './converter.js';

const testHtml = `
<section class="hero-section">
  <div class="container">
    <h1>Super Hero Title</h1>
    <p>This is a test description paragraph for conversion.</p>
    <a href="https://example.com" class="btn">Explore Now</a>
    <img src="https://example.com/banner.jpg" alt="Banner">
  </div>
</section>
`;

const result = HtmlConverterEngine.convert(testHtml, 'elementor', { title: 'Test Hero' });
console.log('Version:', result.version);
console.log('Title:', result.title);
console.log('Root Containers count:', result.content.length);
console.log('Child elements count:', result.content[0].elements.length);
console.log('Conversion SUCCESSFUL!');
