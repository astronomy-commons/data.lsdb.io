import { createRequire } from 'module';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const { render } = require('./dist-server/ssr.cjs');

const catalogIndex = JSON.parse(readFileSync('./data/catalogs.json', 'utf-8'));
const rubinIndex = JSON.parse(readFileSync('./data/rubinCatalogs.json', 'utf-8'));

// Recursively collect all leaf entries (with encoded URL path and raw dir) from a nested catalog tree
const collectLeaves = (items, basePath) => {
  const leaves = [];
  for (const item of items) {
    if ('dir' in item) {
      const encoded = item.dir.split('/').map(encodeURIComponent).join('/');
      leaves.push({ urlPath: `${basePath}/${encoded}`, dir: item.dir });
    } else {
      leaves.push(...collectLeaves(item.catalogs, basePath));
    }
  }
  return leaves;
};

const leaves = [
  ...collectLeaves(catalogIndex, ''),
  ...collectLeaves(rubinIndex, '/rubin'),
];

const rootPages = [
  { urlPath: '/', description: 'Browse public astronomy catalogs in the HATS format, including Gaia, ZTF, Rubin, Pan-STARRS, and more.' },
  { urlPath: '/rubin', description: 'Browse Rubin catalogs in the HATS format.' },
];

const truncate = (text, max = 155) => {
  if (!text || text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(' ', max)) + '…';
};

const getCatalogDescription = (dir) => {
  const catalogPath = `./data/${dir}/catalog.json`;
  if (!existsSync(catalogPath)) return null;
  try {
    const { name, description } = JSON.parse(readFileSync(catalogPath, 'utf-8'));
    const base = description || name || null;
    return truncate(base);
  } catch {
    return null;
  }
};

const template = readFileSync('./dist/index.html', 'utf-8');

const getTitle = (urlPath) => {
  if (urlPath === '/') return 'LSDB';
  if (urlPath === '/rubin') return 'Rubin Data — LSDB';
  const last = urlPath.split('/').at(-1);
  return `${decodeURIComponent(last).replaceAll('_', ' ')} — LSDB`;
};

const writePage = (urlPath, description) => {
  const body = render(urlPath);
  const title = getTitle(urlPath);

  const html = template
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta content="" name="description">/,
      `<meta content="${description ?? ''}" name="description">`
    )
    .replace(
      '<div id="hero" class="hero d-flex align-items-center"></div>',
      `<div id="hero" class="hero d-flex align-items-center">${body}</div>`
    );

  const outDir = path.join('dist', urlPath === '/' ? '' : decodeURIComponent(urlPath));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, 'index.html'), html);
};

// Root pages
for (const { urlPath, description } of rootPages) {
  writePage(urlPath, description);
}

// Leaf catalog pages
for (const { urlPath, dir } of leaves) {
  const description = getCatalogDescription(dir);
  writePage(urlPath, description);
}

// Sitemap
const allPaths = [
  ...rootPages.map((p) => p.urlPath),
  ...leaves.map((l) => l.urlPath),
];

const BASE_URL = 'https://data.lsdb.io';
const entries = allPaths.map((p) => `  <url><loc>${BASE_URL}${p}</loc></url>`).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
writeFileSync('dist/sitemap.xml', sitemap);

console.log(`SSG: generated ${allPaths.length} pages + sitemap.xml`);
