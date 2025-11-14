const fs = require('fs');
const path = require('path');

module.exports = (options, context) => {
  return {
    generated() {
      const sitemapIndexPath = path.resolve(context.outDir || options.dest, 'sitemap-index.xml');
      const sitemaps = [
        'https://grapesjs.com/sitemap.xml',
        'https://grapesjs.com/docs/sitemap.xml',
        'https://app.grapesjs.com/sitemap.xml',
      ];

      const now = new Date().toISOString();
      const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (sitemap) => `  <sitemap>
    <loc>${sitemap}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`,
  )
  .join('\n')}
</sitemapindex>`;

      fs.writeFileSync(sitemapIndexPath, sitemapIndexXml);
      console.log(`\n✅ Sitemap index generated at ${sitemapIndexPath}`);
    },
  };
};
