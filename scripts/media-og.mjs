import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import sharp from 'sharp';
import { publishFile } from './media-files.mjs';

const pages = {
  home: { pt: 'Isabelly Lima', en: 'Isabelly Lima', photo: 1 },
  work: { pt: 'Trabalhos', en: 'Work', cover: 'social-media' },
  about: { pt: 'Sobre mim', en: 'About me', photo: 2 },
  contact: { pt: 'Vamos conversar?', en: 'Let’s talk', photo: 4 },
  error: { pt: 'Página não encontrada', en: 'Page not found', photo: 5 }
};
const brand = { pt: 'Design gráfico e ilustração', en: 'Graphic design and illustration' };
const faces = {
  display: ['Pirata One', 'pirata-one/files/pirata-one-latin-400-normal.woff'],
  mono: ['IBM Plex Mono', 'ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff']
};

// O renderizador de texto do Sharp no Windows precisa das tabelas sfnt fora do contêiner web.
async function unpackFont(root, face) {
  const [, source] = faces[face];
  const woff = await readFile(path.join(root, 'node_modules/@fontsource', source));
  const count = woff.readUInt16BE(12);
  const ttf = Buffer.alloc(woff.readUInt32BE(16));
  woff.copy(ttf, 0, 4, 8);
  const power = Math.floor(Math.log2(count));
  ttf.writeUInt16BE(count, 4);
  ttf.writeUInt16BE(16 * 2 ** power, 6);
  ttf.writeUInt16BE(power, 8);
  ttf.writeUInt16BE(16 * (count - 2 ** power), 10);
  let offset = 12 + count * 16;
  let head;
  for (let i = 0; i < count; i++) {
    const entry = 44 + 20 * i, dest = 12 + 16 * i;
    const start = woff.readUInt32BE(entry + 4);
    const compressed = woff.readUInt32BE(entry + 8), length = woff.readUInt32BE(entry + 12);
    const table = woff.subarray(start, start + compressed);
    (compressed === length ? table : inflateSync(table)).copy(ttf, offset);
    woff.copy(ttf, dest, entry, entry + 4);
    woff.copy(ttf, dest + 4, entry + 16, entry + 20);
    ttf.writeUInt32BE(offset, dest + 8);
    ttf.writeUInt32BE(length, dest + 12);
    if (woff.toString('ascii', entry, entry + 4) === 'head') head = offset;
    offset += 4 * Math.ceil(length / 4);
  }
  ttf.writeUInt32BE(0, head + 8);
  let sum = 0;
  for (let i = 0; i < ttf.length; i += 4) sum = (sum + ttf.readUInt32BE(i)) >>> 0;
  ttf.writeUInt32BE((0xb1b0afba - sum) >>> 0, head + 8);
  const folder = path.join(root, '_material/.cache/fontes-og');
  await mkdir(folder, { recursive: true });
  const file = path.join(folder, `${face}.ttf`);
  await writeFile(file, ttf);
  return file;
}

function textLayer(fonts, text, face, size, width, colour) {
  const [family] = faces[face];
  const escaped = text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return sharp({ text: {
    text: `<span foreground="${colour}">${escaped}</span>`, font: `${family} ${size}`,
    fontfile: fonts[face], rgba: true, width, wrap: 'word-char'
  } }).png().toBuffer({ resolveWithObject: true });
}

const ground = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#13071d"/>
  <g fill="none" stroke="#422a54"><path d="M44 109H671M44 525H671"/><circle cx="630" cy="318" r="201"/><circle cx="630" cy="318" r="167"/></g>
  <circle cx="57" cy="67" r="8" fill="#9069b1"/><circle cx="79" cy="67" r="8" fill="#c7c7d1"/>
</svg>`);

export async function prepareOpenGraph(root, seed, manifest) {
  const fonts = {};
  for (const face of Object.keys(faces)) fonts[face] = await unpackFont(root, face);
  for (const lang of ['pt', 'en']) {
    const folder = path.join(root, 'public/og', lang);
    await mkdir(folder, { recursive: true });
    const layouts = Object.entries(pages).map(([key, page]) => ({
      key, title: page[lang], caption: brand[lang],
      image: page.cover ? manifest.covers[page.cover] : manifest.photos[page.photo]
    }));
    for (const page of seed.cases) layouts.push({
      key: page.slug, title: page.titulo[lang], caption: page.categoria[lang],
      image: manifest.covers[page.slug]
    });
    for (const { key, title, caption, image } of layouts) {
      const source = path.join(root, 'src/assets', manifest.items[image].asset);
      const visual = await sharp(source).resize(530, 630, { fit: 'cover', position: 'centre' }).toBuffer();
      const label = key === 'home' ? (lang === 'pt' ? 'PORTFÓLIO' : 'PORTFOLIO') : 'ISABELLY LIMA';
      const [heading, eyebrow, description] = await Promise.all([
        textLayer(fonts, title, 'display', title.length > 16 ? 76 : 96, 580, '#f1ecf4'),
        textLayer(fonts, label, 'mono', 23, 470, '#c7c7d1'),
        textLayer(fonts, caption, 'mono', 27, 580, '#ded6e4')
      ]);
      const output = path.join(folder, `${key}.jpg`);
      const temporary = path.join(folder, `.${randomUUID()}.jpg`);
      try {
        await sharp(ground).composite([
          { input: visual, left: 670, top: 0 },
          { input: eyebrow.data, left: 112, top: 55 },
          { input: heading.data, left: 44, top: Math.round(316 - heading.info.height / 2) },
          { input: description.data, left: 44, top: 561 }
        ]).jpeg({ quality: 86, mozjpeg: true }).toFile(temporary);
        await publishFile(temporary, output);
      } finally {
        await rm(temporary, { force: true });
      }
    }
  }
}
