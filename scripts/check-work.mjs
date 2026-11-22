import assert from 'node:assert/strict';
import sharp from 'sharp';
import seed from '../docs/briefing/projetos.seed.json' with { type: 'json' };

const base = new URL(process.argv[2] ?? 'http://127.0.0.1:4321');
const orderedCases = [...seed.cases].sort((a, b) => a.ordem - b.ordem);

async function request(path) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(10000) });
  assert.equal(response.status, 200, `${path} retornou HTTP ${response.status}`);
  return response;
}

async function checkCover(card, slug) {
  const srcset = card.match(/<source\b[^>]*\bsrcset="([^"]+)"/)?.[1];
  assert.ok(srcset, `Capa responsiva ausente em ${slug}.`);
  const [url, descriptor] = srcset.split(',').at(-1).trim().split(/\s+/);
  const response = await request(url);
  const { width, height } = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
  assert.equal(width, height, `A capa de ${slug} precisa de um recorte quadrado para o grid.`);
  assert.equal(descriptor, width + 'w', `O srcset da capa de ${slug} deve informar a largura do arquivo.`);
}

for (const [lang, listing] of [['pt', '/trabalhos/'], ['en', '/en/work/']]) {
  const grid = await (await request(listing)).text();
  const anchors = Array.from(grid.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g));
  const cards = anchors.filter(([, link]) => link.startsWith(listing) && link !== listing);
  const expected = orderedCases.map(project => listing + project.slug + '/');
  assert.deepEqual(cards.map(([, link]) => link), expected, `Cases ausentes ou fora de ordem em ${listing}.`);

  await Promise.all(cards.map(async ([, link, card]) => {
    const page = await (await request(link)).text();
    assert.ok(page.includes('data-page="case"'), `${link} precisa renderizar um case.`);
    assert.ok(page.includes(`data-lang="${lang}"`), `Idioma incorreto em ${link}.`);
    const slug = link.slice(listing.length, -1);
    const equivalent = (lang === 'pt' ? '/en/work/' : '/trabalhos/') + slug + '/';
    assert.ok(page.includes(`href="${equivalent}"`), `Alternância de idioma ausente em ${link}.`);
    if (lang === 'pt') await checkCover(card, slug);
  }));
  console.log(`${listing} e seus ${cards.length} cases passaram.`);
}
