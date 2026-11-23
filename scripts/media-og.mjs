import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import sharp from 'sharp';
import { publishFile } from './media-files.mjs';

const pages = {
  home: { title: ['Isabelly Lima', 'Isabelly Lima'], caption: ['Designer gráfica e ilustradora', 'Graphic designer and illustrator'], image: 'foto-1', paper: '#ac8fb5' },
  work: { title: ['Trabalhos', 'Work'], caption: ['Marcas, impressos e ilustrações', 'Branding, print and illustration'], paper: '#d4bed1' },
  about: { title: ['Sobre mim', 'About me'], caption: ['Percurso e influências', 'Background and influences'], image: 'sobre-infancia', paper: '#c9b3cb' },
  contact: { title: ['Vamos conversar?', 'Let’s talk'], caption: ['Contato', 'Contact'], image: 'foto-4', paper: '#c7b1c6' },
  error: { title: ['404', '404'], caption: ['Página perdida', 'Page not found'], paper: '#c9b3cb',
    graphic: { file: 'media/gravuras/morcego.png', width: 575, alt: { pt: 'Gravura de um morcego de asas abertas sobre papel lilás.', en: 'An engraving of a bat with outstretched wings on lilac paper.' } } },
  privacy: { title: ['Privacidade', 'Privacy'], caption: ['Dados pessoais', 'Personal data'], paper: '#d4c3d6',
    graphic: { file: 'cursor/gato-ameixa.svg', width: 265, alt: { pt: 'O símbolo da marca é a cabeça de um gato roxo sobre papel lilás.', en: 'The brand’s purple cat-head symbol is centred on lilac paper.' } } }
};
const projects = {
  'vanessa-rosa': { paper: '#dbccc2' },
  'isys-karoline': { paper: '#c2d8e4' },
  'brucutu-chapeiro': { paper: '#edd4ac' },
  'social-media': { paper: '#cbb9dd', caption: ['Posts, carrosséis e reels', 'Posts, carousels and reels'] },
  'material-grafico': { paper: '#dcd7b9', caption: ['Cartões, folders e capas', 'Cards, leaflets and covers'] },
  video: { paper: '#b6d6d3', caption: ['Reels e motion design', 'Reels and motion design'] },
  ilustracao: { paper: '#d7c9bd', caption: ['Do grafite ao vetor', 'From pencil to vector'] }
};
const workSelection = ['vanessa-rosa', 'material-grafico', 'ilustracao'];
const faces = {
  display: ['Pirata One', 'pirata-one/files/pirata-one-latin-400-normal.woff'],
  body: ['Urbanist Medium', 'urbanist/files/urbanist-latin-500-normal.woff'],
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
    fontfile: fonts[face], rgba: true, width, wrap: 'word'
  } }).png().toBuffer({ resolveWithObject: true });
}

const width = 1200, height = 630, split = 500, margin = 58;
const solid = (w, h, colour) => sharp({ create: { width: w, height: h, channels: 4, background: colour } });
const asPng = image => image.png().toBuffer({ resolveWithObject: true });

async function fitHeading(fonts, title) {
  let size = title === '404' ? 204 : 118;
  for (;;) {
    const layer = await textLayer(fonts, title, 'display', size, split - margin - 23, '#f6eef5');
    if (layer.info.width <= split - margin - 23 && layer.info.height < 242) return layer;
    if (size <= 52) throw new Error(`O título não cabe no cartão: ${title}`);
    size -= 3;
  }
}

async function paper(root, colour) {
  const rgb = colour.match(/[a-f0-9]{2}/gi).map(channel => Number.parseInt(channel, 16));
  return sharp(path.join(root, 'public/media/texturas/papel.webp')).resize(width - split, height, { fit: 'cover' })
    .toColourspace('srgb').linear([.28, .28, .28], rgb.map(channel => channel - 66)).png().toBuffer();
}

function centered({ data, info }) {
  return { input: data, left: split + Math.round((width - split - info.width) / 2), top: Math.round((height - info.height) / 2) };
}

async function print(source, portrait) {
  const image = await sharp(source).resize({ width: portrait ? 485 : 598, height: portrait ? 480 : 494, fit: 'inside' }).png().toBuffer();
  const border = portrait ? 11 : 3;
  const mounted = await sharp(image).extend({ top: border, bottom: portrait ? 32 : border, left: border, right: border, background: '#f5edef' }).png().toBuffer();
  return asPng(portrait ? sharp(mounted).rotate(-3, { background: '#0000' }) : sharp(mounted));
}

async function artwork(root, manifest, layout) {
  const source = key => path.join(root, 'src/assets', manifest.items[key].asset);
  const visuals = [];
  let alt;
  if (layout.key === 'work') {
    const boxes = [[0, 0, 604, 260], [0, 270, 297, 200], [307, 270, 297, 200]];
    for (const [i, project] of workSelection.entries()) {
      const [x, y, w, h] = boxes[i];
      visuals.push({ input: await sharp(source(manifest.covers[project])).resize(w, h, { fit: 'cover' }).png().toBuffer(), left: split + 48 + x, top: 80 + y });
    }
    alt = { pt: 'Monograma de Vanessa Rosa sobre mãos, cartões de AmarElo Fotografia e retratos em grafite num caderno.', en: 'Vanessa Rosa’s monogram over a photograph of hands, AmarElo Fotografia business cards and pencil portraits in a sketchbook.' };
  } else if (layout.graphic) {
    const { file, width, alt: description } = layout.graphic;
    visuals.push(centered(await asPng(sharp(path.join(root, 'public', file)).resize({ width }))));
    alt = description;
  } else if (layout.key === 'video' && manifest.videoFrames.length === 3) {
    for (const [i, key] of manifest.videoFrames.entries()) {
      const frame = await sharp(source(key)).resize({ width: 196, height: 348, fit: 'inside' }).png().toBuffer();
      visuals.push({ input: frame, left: split + 48 + 204 * i, top: 141 });
    }
    alt = { pt: 'Três quadros verticais de reels mostram rostos em pixel art, um cronômetro e letras sobre magenta.', en: 'Three vertical reel frames show pixel-art faces, a stopwatch and lettering on magenta.' };
  } else {
    const key = layout.image;
    visuals.push(centered(await print(source(key), ['home', 'about', 'contact'].includes(layout.key))));
    alt = manifest.items[key].alt;
  }
  return { visuals, alt };
}

async function publishChanged(output, bytes) {
  const previous = await readFile(output).catch(error => {
    if (error.code !== 'ENOENT') throw error;
  });
  if (previous?.equals(bytes)) return;
  const temporary = path.join(path.dirname(output), `.${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, bytes);
    await publishFile(temporary, output);
  } finally {
    await rm(temporary, { force: true });
  }
}

export async function prepareOpenGraph(root, seed, manifest) {
  const fonts = {};
  for (const face of Object.keys(faces)) fonts[face] = await unpackFont(root, face);
  const layouts = Object.entries(pages).map(([key, page]) => ({ key, ...page }));
  for (const page of seed.cases) {
    const { slug, titulo, categoria } = page;
    const style = projects[slug] ?? {};
    layouts.push({ key: slug, image: manifest.covers[slug], title: [titulo.pt, titulo.en],
      caption: style.caption ?? [categoria.pt, categoria.en], paper: style.paper ?? '#d4c4cf' });
  }
  const metadata = { pt: {}, en: {} };
  for (const lang of Object.keys(metadata)) await mkdir(path.join(root, 'public/og', lang), { recursive: true });
  const damask = await sharp(path.join(root, 'public/media/texturas/damask.webp')).resize(split, height, { fit: 'cover' })
    .toColourspace('srgb').linear([.38, .22, .42], [22, 8, 31]).png().toBuffer();
  const cat = await sharp(path.join(root, 'public/cursor/gato-lavanda.svg')).resize(34, 34).png().toBuffer();
  const rule = await solid(split - 2 * margin, 2, '#846b86').png().toBuffer();

  for (const layout of layouts) {
    const { visuals, alt } = await artwork(root, manifest, layout);
    const backdrop = await paper(root, layout.paper);
    for (const [i, lang] of ['pt', 'en'].entries()) {
      const title = layout.title[i], caption = layout.caption[i];
      const label = layout.key === 'home' ? ['PORTFÓLIO', 'PORTFOLIO'][i] : 'ISABELLY LIMA';
      const [heading, name, detail] = await Promise.all([
        fitHeading(fonts, title),
        textLayer(fonts, label, 'mono', 26, 340, '#dfd0e5'),
        textLayer(fonts, caption, 'body', 32, split - 2 * margin, '#f1e7f3')
      ]);
      const jpeg = await solid(width, height, '#190d24').composite([
        { input: damask, left: 0, top: 0 }, { input: backdrop, left: split, top: 0 },
        ...visuals, { input: cat, left: margin, top: 57 }, { input: name.data, left: margin + 49, top: 63 },
        { input: heading.data, left: margin, top: Math.round((height - heading.info.height) / 2) - 8 },
        { input: rule, left: margin, top: 480 }, { input: detail.data, left: margin, top: 504 }
      ]).jpeg({ quality: 92, chromaSubsampling: '4:4:4', mozjpeg: true }).toBuffer();
      const pathname = `/og/${lang}/${layout.key}.jpg`;
      await publishChanged(path.join(root, 'public', pathname), jpeg);
      const version = createHash('sha256').update(jpeg).digest('hex').slice(0, 12);
      const text = [label === 'ISABELLY LIMA' ? 'Isabelly Lima' : label, title, caption].join(' · ');
      metadata[lang][layout.key] = { image: `${pathname}?v=${version}`, alt: `${text}. ${alt[lang]}` };
    }
  }
  await publishChanged(path.join(root, 'src/data/open-graph.json'), Buffer.from(JSON.stringify(metadata, null, 2) + '\n'));
}
