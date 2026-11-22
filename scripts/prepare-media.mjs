import { readFile, writeFile, mkdir, stat, rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { extractCoverFrame, prepareFile, prepareVideo, probeVideo, publishFile } from './media-files.mjs';
import { altFor, photoDescriptions } from './media-alt.mjs';
import { prepareOpenGraph } from './media-og.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const projectPath = (...parts) => path.join(root, ...parts);
const seed = JSON.parse(await readFile(projectPath('docs/briefing/projetos.seed.json'), 'utf8'));
// Os números já publicados continuam associados aos mesmos originais quando a ordem editorial muda.
const fileSlots = JSON.parse(await readFile(projectPath('scripts/media-slots.json'), 'utf8'));
const originals = projectPath('_material/isabelly');
const publicDir = projectPath('public');
const manifest = { items: {}, covers: {}, gridCovers: {}, videoFrames: [], photos: {}, slides: {} };
const images = [], videos = [], caseDocuments = [];
const recipeTime = (await stat(fileURLToPath(import.meta.url))).mtimeMs;
sharp.concurrency(2);

const ascii = (name) => name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function registerImage(key, input, directory, name, alt, options = {}) {
  const meta = await sharp(input).metadata();
  const { width: w, height: h } = meta.autoOrient;
  const { max = 2560, cover = false, focusX } = options;
  const square = focusX !== undefined;
  const edge = Math.min(w, h);
  const crop = square ? { width: edge, height: edge, left: Math.round((w - edge) * focusX), top: Math.round((h - edge) / 2) } : undefined;
  const originalWidth = crop?.width ?? w, originalHeight = crop?.height ?? h;
  const ratio = Math.min(1, max / Math.max(originalWidth, originalHeight));
  const width = Math.round(originalWidth * ratio), height = Math.round(originalHeight * ratio);
  const candidates = cover ? [360, 480, 640, 800, 960, 1280, 1600, 1920, 2560, 3200]
    : key === 'foto-1' ? [320, 480, 640, 960, 1280, 1920] : [640, 960, 1280, 1920];
  const widths = (options.widths ?? candidates).filter((value) => value < width).concat(width);
  const asset = `${directory}/${name}.webp`;
  const url = `/media/${directory}/${name}`;
  manifest.items[key] = { kind: 'image', asset, width, height, widths, url, alt };
  images.push(async () => {
    const resize = (target) => {
      const image = sharp(input).rotate();
      if (crop) image.extract(crop);
      return image.resize({ width: target, withoutEnlargement: true });
    };
    const webpOptions = cover ? { quality: 94, effort: 5, smartSubsample: true } : { quality: 82, effort: 3, smartSubsample: true };
    const avifOptions = cover ? { quality: 73, effort: 4, chromaSubsampling: '4:4:4' } : { quality: 53, effort: 1 };
    const imageRecipeTime = cover ? recipeTime : 0;
    for (const size of widths) {
      const webp = size === width ? projectPath('src/assets', asset) : path.join(publicDir, `${url}-${size}.webp`);
      await prepareFile(input, webp, (file) => resize(size).webp(webpOptions).toFile(file), imageRecipeTime);
      await prepareFile(input, path.join(publicDir, `${url}-${size}.avif`), (file) => resize(size).avif(avifOptions).toFile(file), imageRecipeTime);
    }
  });
}

async function registerGridCover(slug, input, alt, cover = {}) {
  const focus = { 'brucutu-chapeiro': .45, 'social-media': .3, 'material-grafico': .46 };
  const key = `grid-${slug}`;
  const name = cover.variante ? `capa-quadrada-${ascii(cover.variante)}` : 'capa-quadrada';
  await registerImage(key, input, `cases/${slug}`, name, alt, {
    cover: true, max: 1920, focusX: cover.focoX ?? focus[slug] ?? .5
  });
  manifest.gridCovers[slug] = key;
}

async function registerVideoCover() {
  const key = 'capa-video', directory = 'cases/video';
  const generated = projectPath('_material/derivadas/capa-video.png');
  manifest.covers.video = key;
  if (await stat(generated).catch(() => false)) {
    const alt = { pt: 'Composição de frames dos reels da 2 Palitos e da Zen Pensions.', en: 'Frames from reels for 2 Palitos and Zen Pensions.' };
    await registerImage(key, generated, directory, 'capa', alt, { cover: true, max: 3840 });
    await registerGridCover('video', generated, alt);
    return;
  }
  const scenes = [
    ['2 Palitos Marketing Digital/2.mp4', 10, { pt: 'Cinco rostos em pixel art sobre turquesa em um reel da 2 Palitos.', en: 'Five pixel-art faces on turquoise in a 2 Palitos reel.' }],
    ['Zen Pensions/4.mp4', 2, { pt: 'Um cronômetro ilustrado com a legenda “30 seconds” em um reel da Zen Pensions.', en: 'An illustrated stopwatch marked “30 seconds” in a Zen Pensions reel.' }],
    ['2 Palitos Marketing Digital/4.mp4', 2, { pt: 'Letras brancas e turquesa sobre magenta em um reel de marketing da 2 Palitos.', en: 'White and turquoise lettering on magenta in a 2 Palitos marketing reel.' }]
  ];
  for (const [index, [source, seconds, alt]] of scenes.entries()) {
    const name = index === 0 ? 'capa' : `frame-${index + 1}`;
    const frameKey = index === 0 ? key : `video-${name}`;
    const still = projectPath('_material/.cache/frames', `${name}.png`);
    await extractCoverFrame(path.join(originals, 'Vídeos', source), still, seconds, recipeTime);
    await registerImage(frameKey, still, directory, name, alt, { cover: true });
    manifest.videoFrames.push(frameKey);
    if (index === 0) await registerGridCover('video', still, alt);
  }
}

async function registerVideo(key, input, slug, name, alt) {
  const { width, height } = await probeVideo(input);
  const base = `/media/${slug}/${name}`;
  const item = { kind: 'video', src: `${base}.mp4`, webm: `${base}.webm`, poster: `${base}.jpg`, width, height, alt };
  manifest.items[key] = item;
  videos.push(async () => prepareVideo(input, publicDir, item));
  return item;
}

function references(blocks) {
  const files = new Set();
  function collect(value) {
    if (!value || typeof value !== 'object') return;
    if (value.arquivo) files.add(value.arquivo);
    if (value.arquivos) value.arquivos.forEach((name) => files.add(name));
    if (Array.isArray(value)) value.forEach(collect);
    else if (value.blocos) collect(value.blocos);
  }
  collect(blocks);
  return [...files];
}

async function jsonFile(name, data) {
  const file = projectPath(name);
  await mkdir(path.dirname(file), { recursive: true });
  const serialized = JSON.stringify(data, null, 2) + '\n';
  if ((await readFile(file, 'utf8').catch(() => '')) === serialized) return;
  const temporary = path.join(path.dirname(file), '.' + randomUUID() + '.tmp');
  try {
    await writeFile(temporary, serialized);
    await publishFile(temporary, file);
  } finally {
    await rm(temporary, { force: true });
  }
}

async function pool(tasks, jobs) {
  const work = tasks.values();
  await Promise.all(Array.from({ length: jobs }, async () => {
    for (const task of work) await task();
  }));
}

async function prepareTexture(name, source, size, quality) {
  const input = path.join(originals, 'Identidade Visual do Site/Texturas', source);
  await prepareFile(input, projectPath(`public/media/texturas/${name}.webp`), (file) =>
    sharp(input).resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
      .webp({ quality, effort: 5 }).toFile(file), recipeTime);
}

// As fotografias originais já usam a identidade da autora. Só dimensionamos e codificamos.
for (const [index, photo] of seed.fotos.itens.entries()) {
  const name = path.parse(photo.novo).name;
  const key = `foto-${index + 1}`;
  manifest.photos[index + 1] = key;
  await registerImage(key, projectPath('_material/fotos', photo.novo), 'isabelly', name, photoDescriptions[index], { max: 1920 });
}

for (const page of seed.cases) {
  const files = references([page.capa, ...page.blocos]);
  const reservedSlots = new Set(files.map(file => fileSlots[file]));
  let nextSlot = 1;
  for (const file of files) {
    while (reservedSlots.has(nextSlot)) nextSlot++;
    const slot = fileSlots[file] ?? nextSlot++;
    const name = `${String(slot).padStart(2, '0')}-${ascii(path.parse(file).name)}`;
    const input = path.join(originals, file);
    const alt = altFor(file);
    if (path.extname(file).toLowerCase() === '.mp4') await registerVideo(file, input, page.slug, name, alt);
    else if (file === page.capa.arquivo) {
      await registerImage(file, input, `cases/${page.slug}`, name, alt, { cover: true, max: 3840 });
      await registerGridCover(page.slug, input, alt, page.capa);
      manifest.covers[page.slug] = file;
    }
    else await registerImage(file, input, `cases/${page.slug}`, name, alt);
  }
  if (!page.capa.arquivo) await registerVideoCover();
  const replace = (key, value) => {
    if (['nota', 'notas', 'origemTexto'].includes(key)) return undefined;
    if (typeof value !== 'string' || !manifest.items[value]) return value;
    const item = manifest.items[value];
    return item.asset ? `src/assets/${item.asset}` : item.src;
  };
  const content = JSON.parse(JSON.stringify({
    ...page,
    ano: String(page.ano).includes('(confirmar)') ? '' : page.ano,
    ferramentas: page.ferramentas.filter((tool) => !tool.includes('(confirmar)')),
    capa: { arquivo: manifest.covers[page.slug] }
  }, replace));
  caseDocuments.push({ slug: page.slug, content });
}

for (const n of [9, 10]) {
  const key = `sobre-slide-${n}`;
  const alt = n === 9
    ? { pt: 'Fotos dos gatos Sukito e Luna em uma colagem roxa da Isabelly.', en: 'Photos of Sukito and Luna in Isabelly’s purple scrapbook collage.' }
    : { pt: 'Isabelly encerra o carrossel sobre seu repertório criativo com uma polaroide.', en: 'A taped portrait of Isabelly closes her scrapbook about her creative influences.' };
  await registerImage(key, path.join(originals, `Identidade Visual do Site/Carrossel 1 (sobre mim)/Slide ${n}.png`), 'isabelly', key, alt, { max: 1080 });
  manifest.slides[n] = key;
}

await registerImage('sobre-infancia', projectPath('_material/fotos/isabelly-infancia.png'), 'isabelly', 'isabelly-infancia', {
  pt: 'Isabelly na infância, de vestido jeans e com presilhas coloridas no cabelo.',
  en: 'Isabelly as a child, wearing a denim dress and colourful hair clips.'
}, { widths: [320, 480, 640, 960, 1280] });

const instagramDir = path.join(originals, 'Identidade Visual do Site');
const postWidths = { widths: [320, 480, 640, 960] };
await registerImage('instagram-marca-bonita', path.join(instagramDir, 'Carrossel 2/Slide 1.jpg'), 'isabelly', 'instagram-marca-bonita-capa', {
  pt: 'Na capa roxa, um gato preto acompanha a pergunta “Sua marca pode ser bonita. Mas será que isso é suficiente?”',
  en: 'A black cat on a purple cover beside a question in Portuguese: “Your brand can be beautiful. But is that enough?”'
}, postWidths);
await registerImage('instagram-isys-capa', path.join(instagramDir, 'Instagram/Dfua3aTGy4V.webp'), 'isabelly', 'instagram-isys-capa', {
  pt: 'Símbolo de Isys Karoline sobre duas pessoas correndo. No rodapé, “Brand Design — Isys Karoline | Personal e Pilates”.',
  en: 'Isys Karoline’s brand symbol over two runners, with a caption identifying her personal training and Pilates practice.'
}, postWidths);
await registerImage('instagram-fundamentos-capa', path.join(instagramDir, 'Carrossel 3/Slide 1.jpg'), 'isabelly', 'instagram-fundamentos-capa', {
  pt: 'Um açougueiro de máscara segura um cutelo ao lado da pergunta “Você faria sua cirurgia com um açougueiro?”',
  en: 'A masked butcher holding a cleaver beside the question “Would you let a butcher perform your surgery?” in Portuguese.'
}, postWidths);

await Promise.all([
  prepareTexture('damask', '1283323_381.jpg', 480, 50),
  prepareTexture('damask-folhas', '1534419_816.jpg', 480, 58),
  prepareTexture('tartan', 'black-tartan-check-background (1).jpg', 512, 57),
  prepareTexture('papel', '895238_2259.jpg', 720, 62)
]);
console.log(`Preparando ${images.length} imagens e ${videos.length} vídeos. As conversões completas são reaproveitadas.`);
await Promise.all([pool(images, 3), pool(videos, 1)]);
await prepareOpenGraph(root, seed, manifest);
await jsonFile('src/data/media.json', manifest);
for (const { slug, content } of caseDocuments) await jsonFile(`src/content/cases/${slug}.json`, content);
console.log('Mídia pronta para o build estático.');
