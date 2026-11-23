import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { parse } from 'ultrahtml';
import { querySelectorAll } from 'ultrahtml/selector';
import seed from '../docs/briefing/projetos.seed.json' with { type: 'json' };
import shareCards from '../src/data/open-graph.json' with { type: 'json' };
import pt from '../src/i18n/pt.json' with { type: 'json' };
import en from '../src/i18n/en.json' with { type: 'json' };

const dist = path.resolve(process.argv[2] ?? 'dist');
const official = 'https://isabelly.des.br';
const preview = new URL(process.env.SOCIAL_PREVIEW_ORIGIN || official);
assert.ok(preview.protocol === 'https:' && preview.href === preview.origin + '/',
  'SOCIAL_PREVIEW_ORIGIN precisa ser uma origem HTTPS sem credenciais, caminho, consulta ou fragmento.');

const pages = [
  { key: 'home', pt: '/', en: '/en/', description: 'siteDesc' },
  { key: 'work', pt: '/trabalhos/', en: '/en/work/', description: 'workDesc' },
  { key: 'about', pt: '/sobre/', en: '/en/about/', description: 'aboutDesc' },
  { key: 'contact', pt: '/contato/', en: '/en/contact/', description: 'contactDesc' },
  { key: 'privacy', pt: '/privacidade/', en: '/en/privacy/', description: 'privacyDesc' },
  { key: 'error', pt: '/404', en: '/en/404/', description: 'errorDesc' },
  ...seed.cases.map(project => ({
    key: project.slug, pt: `/trabalhos/${project.slug}/`, en: `/en/work/${project.slug}/`, project,
  })),
];
const locales = { pt: 'pt-BR', en: 'en-GB' };
const technical = ['projetos/case/index.html', 'treino.html', 'treino/index.html'];
const htmlFiles = ['en/404.html', ...technical];
const imageFiles = [];
const indexed = [];

async function markup(file) {
  return parse(await readFile(path.join(dist, file), 'utf8'));
}

function textOf(node) {
  return node.children.map(child => child.value ?? '').join('');
}

// O parser conserva as entidades que o Astro escapa em textos e atributos.
function unescape(value) {
  const entities = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' };
  return value.replace(/&(amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, (_, entity) => {
    if (entity[0] !== '#') return entities[entity.toLowerCase()];
    return String.fromCodePoint(entity[1].toLowerCase() === 'x'
      ? Number.parseInt(entity.slice(2), 16) : Number(entity.slice(1)));
  }).trim();
}

function field(doc, selector, attribute = 'content') {
  const matches = querySelectorAll(doc, selector);
  assert.equal(matches.length, 1, `Esperava exatamente um ${selector}, encontrei ${matches.length}.`);
  const value = attribute === 'text' ? textOf(matches[0]) : matches[0].attributes[attribute];
  assert.ok(value?.trim(), `${selector} sem ${attribute}.`);
  return unescape(value);
}

function robotRules(doc) {
  return querySelectorAll(doc, 'head > meta[name="robots"]').map(node => node.attributes.content).join(',');
}

async function checkCard(page, lang) {
  const route = page[lang];
  const file = route === '/404' ? '404.html' : route.slice(1) + 'index.html';
  const doc = await markup(file);
  const copy = lang === 'pt' ? pt : en;
  const other = lang === 'pt' ? 'en' : 'pt';
  const title = field(doc, 'head > title', 'text');
  const description = field(doc, 'head > meta[name="description"]');
  const canonical = official + route;
  const socialUrl = preview.origin + route;
  const imageFile = `og/${lang}/${page.key}.jpg`;
  const jpeg = await readFile(path.join(dist, imageFile));
  const version = createHash('sha256').update(jpeg).digest('hex').slice(0, 12);
  const imageUrl = `${preview.origin}/${imageFile}?v=${version}`;
  const { format, width, height } = await sharp(jpeg).metadata();
  assert.deepEqual([format, width, height], ['jpeg', 1200, 630], `Formato ou dimensões incorretas em ${imageFile}.`);
  await sharp(jpeg).resize(1, 1).raw().toBuffer();

  assert.equal(field(doc, 'html', 'lang'), locales[lang]);
  assert.equal(field(doc, 'head > link[rel="canonical"]', 'href'), canonical);
  for (const [tag, url] of [[locales.pt, page.pt], [locales.en, page.en], ['x-default', page.pt]]) {
    assert.equal(field(doc, `head > link[rel="alternate"][hreflang="${tag}"]`, 'href'), official + url);
  }
  assert.equal(description, page.project ? page.project.linhaHover[lang] : copy[page.description]);
  const homeTitle = lang === 'pt' ? 'Designer gráfica e ilustradora' : 'Graphic designer and illustrator';
  const expectedTitle = page.key === 'home' ? homeTitle : (page.project?.titulo[lang] ?? copy[page.key]);
  assert.ok(title.includes(expectedTitle), `Título incorreto: ${title}`);
  const noindex = /\b(?:noindex|none)\b/i.test(robotRules(doc));
  assert.equal(noindex, page.key === 'error', 'Regra de indexação incorreta.');

  const alt = field(doc, 'head > meta[property="og:image:alt"]');
  assert.equal(alt, shareCards[lang][page.key]?.alt, 'Texto alternativo incorreto para esta página e idioma.');
  const og = {
    type: page.project ? 'article' : 'website', site_name: 'Isabelly Lima', title, description,
    url: socialUrl, locale: locales[lang].replace('-', '_'), 'locale:alternate': locales[other].replace('-', '_'),
    image: imageUrl, 'image:width': '1200', 'image:height': '630', 'image:type': 'image/jpeg',
  };
  for (const [key, expected] of Object.entries(og)) {
    assert.equal(field(doc, `head > meta[property="og:${key}"]`), expected, `og:${key} incorreto.`);
  }
  const twitter = { card: 'summary_large_image', title, description, image: imageUrl, 'image:alt': alt };
  for (const [key, expected] of Object.entries(twitter)) {
    assert.equal(field(doc, `head > meta[name="twitter:${key}"]`), expected, `twitter:${key} incorreto.`);
  }
  htmlFiles.push(file);
  imageFiles.push(imageFile.slice('og/'.length));
  if (!noindex) indexed.push(canonical);
  return alt;
}

for (const page of pages) {
  const alts = {};
  for (const lang of ['pt', 'en']) {
    try {
      alts[lang] = await checkCard(page, lang);
    } catch (error) {
      throw new Error(`${page[lang]} — ${error.message}`, { cause: error });
    }
  }
  assert.notEqual(alts.pt, alts.en, `O texto alternativo do card ${page.key} precisa estar localizado.`);
}

const originalTraining = await readFile(new URL('../public/treino.html', import.meta.url));
for (const file of technical) {
  const doc = await markup(file);
  assert.match(robotRules(doc), /\bnoindex\b/i, `${file} precisa permanecer fora do índice.`);
  const meta = querySelectorAll(doc, 'head > meta');
  const names = meta.flatMap(node => [node.attributes.property ?? '', node.attributes.name ?? '']);
  if (file.startsWith('treino')) {
    // A v1 preservada contém cinco tags OG de texto, sem uma imagem social ou Twitter.
    assert.ok(originalTraining.equals(await readFile(path.join(dist, file))), `O build alterou ${file}.`);
    assert.ok(!names.some(name => /^(?:og:image|twitter:)/i.test(name)), `Card de portfólio em ${file}.`);
  } else {
    assert.ok(!names.some(name => /^(?:og:|twitter:)/i.test(name)), `Card social na reserva ${file}.`);
  }
}
assert.ok((await readFile(path.join(dist, 'en/404.html'))).equals(await readFile(path.join(dist, 'en/404/index.html'))),
  'O alias do Cloudflare Pages precisa entregar o mesmo 404 inglês.');

async function listFiles(directory, extension) {
  return (await readdir(directory, { recursive: true })).filter(file => file.endsWith(extension))
    .map(file => file.split(path.sep).join('/')).sort();
}
assert.deepEqual(await listFiles(dist, '.html'), htmlFiles.sort(), 'HTML do build ausente ou sem classificação.');
assert.deepEqual(await listFiles(path.join(dist, 'og'), '.jpg'), imageFiles.sort(), 'Inventário de JPEGs OG divergente.');
const sitemapIndex = await markup('sitemap-index.xml');
assert.deepEqual(querySelectorAll(sitemapIndex, 'sitemap > loc').map(textOf), [official + '/sitemap-0.xml'],
  'O índice do sitemap precisa apontar para o sitemap oficial.');
const sitemap = await markup('sitemap-0.xml');
assert.deepEqual(querySelectorAll(sitemap, 'url > loc').map(textOf).sort(), indexed.sort(),
  'O sitemap precisa conter cada página indexável uma vez, no domínio oficial.');
console.log(`${imageFiles.length} cards OG/Twitter validados, ${indexed.length} URLs no sitemap e exceções técnicas conferidas.`);
