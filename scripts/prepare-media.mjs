import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { prepareFile, prepareVideo, probeVideo } from './media-files.mjs';
import { altFor, photoDescriptions } from './media-alt.mjs';
import { prepareOpenGraph } from './media-og.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const projectPath = (...parts) => path.join(root, ...parts);
const seed = JSON.parse(await readFile(projectPath('docs/briefing/projetos.seed.json'), 'utf8'));
const originals = projectPath('_material/isabelly');
const publicDir = projectPath('public');
const manifest = { items: {}, covers: {}, photos: {}, slides: {} };
const images = [], videos = [];
sharp.concurrency(2);

const ascii = (name) => name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function registerImage(key, input, directory, name, alt, max = 2560) {
  const meta = await sharp(input).metadata();
  const { width: w, height: h } = meta.autoOrient;
  const ratio = Math.min(1, max / Math.max(w, h));
  const width = Math.round(w * ratio), height = Math.round(h * ratio);
  const candidates = key === 'foto-1' ? [320, 480, 640, 960, 1280, 1920] : [640, 960, 1280, 1920];
  const widths = candidates.filter((value) => value < width).concat(width);
  const asset = `${directory}/${name}.webp`;
  const url = `/media/${directory}/${name}`;
  manifest.items[key] = { kind: 'image', asset, width, height, widths, url, alt };
  images.push(async () => {
    const resize = (target) => sharp(input).rotate().resize({ width: target, withoutEnlargement: true });
    for (const size of widths) {
      const webp = size === width ? projectPath('src/assets', asset) : path.join(publicDir, `${url}-${size}.webp`);
      await prepareFile(input, webp, (file) => resize(size).webp({ quality: 82, effort: 3, smartSubsample: true }).toFile(file));
      await prepareFile(input, path.join(publicDir, `${url}-${size}.avif`), (file) => resize(size).avif({ quality: 53, effort: 1 }).toFile(file));
    }
  });
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
  if ((await readFile(file, 'utf8').catch(() => '')) !== serialized) await writeFile(file, serialized);
}

async function pool(tasks, jobs) {
  const work = tasks.values();
  await Promise.all(Array.from({ length: jobs }, async () => {
    for (const task of work) await task();
  }));
}

async function prepareTexture(name, source, size, quality) {
  const input = path.join(originals, 'Identidade Visual do Site/Texturas', source);
  const recipeTime = (await stat(fileURLToPath(import.meta.url))).mtimeMs;
  await prepareFile(input, projectPath(`public/media/texturas/${name}.webp`), (file) =>
    sharp(input).resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
      .webp({ quality, effort: 5 }).toFile(file), recipeTime);
}

// As fotografias originais já usam a identidade da autora. Só dimensionamos e codificamos.
for (const [index, photo] of seed.fotos.itens.entries()) {
  const name = path.parse(photo.novo).name;
  const key = `foto-${index + 1}`;
  manifest.photos[index + 1] = key;
  await registerImage(key, projectPath('_material/fotos', photo.novo), 'isabelly', name, photoDescriptions[index], 1920);
}

for (const page of seed.cases) {
  const files = references([page.capa, ...page.blocos]);
  for (const [index, file] of files.entries()) {
    const name = `${String(index + 1).padStart(2, '0')}-${ascii(path.parse(file).name)}`;
    const input = path.join(originals, file);
    const alt = altFor(file);
    if (path.extname(file).toLowerCase() === '.mp4') await registerVideo(file, input, page.slug, name, alt);
    else await registerImage(file, input, `cases/${page.slug}`, name, alt);
  }
  if (page.capa.arquivo) manifest.covers[page.slug] = page.capa.arquivo;
  else {
    const generated = projectPath('_material/derivadas/capa-video.png');
    const coverKey = 'capa-video';
    manifest.covers[page.slug] = coverKey;
    if (await stat(generated).catch(() => false)) {
      await registerImage(coverKey, generated, 'cases/video', 'capa', { pt: 'Composição de frames dos reels da 2 Palitos e da Zen Pensions.', en: 'Frames from reels for 2 Palitos and Zen Pensions.' });
    } else {
      const video = manifest.items[files[0]];
      const input = path.join(originals, files[0]);
      await prepareVideo(input, publicDir, video, true);
      await registerImage(coverKey, path.join(publicDir, video.poster), 'cases/video', 'capa', { pt: 'Frame de um reel da 2 Palitos Marketing Digital.', en: 'A still from a reel for 2 Palitos Marketing Digital.' });
    }
  }
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
  await jsonFile(`src/content/cases/${page.slug}.json`, content);
}

for (const n of [9, 10]) {
  const key = `sobre-slide-${n}`;
  const alt = n === 9
    ? { pt: 'Fotos dos gatos Sukito e Luna em uma colagem roxa da Isabelly.', en: 'Photos of Sukito and Luna in Isabelly’s purple scrapbook collage.' }
    : { pt: 'Isabelly encerra o carrossel sobre seu repertório criativo com uma polaroide.', en: 'A taped portrait of Isabelly closes her scrapbook about her creative influences.' };
  await registerImage(key, path.join(originals, `Identidade Visual do Site/Carrossel 1 (sobre mim)/Slide ${n}.png`), 'isabelly', key, alt, 1080);
  manifest.slides[n] = key;
}

await Promise.all([
  prepareTexture('damask', '1283323_381.jpg', 480, 50),
  prepareTexture('damask-folhas', '1534419_816.jpg', 480, 58),
  prepareTexture('tartan', 'black-tartan-check-background (1).jpg', 512, 57),
  prepareTexture('papel', '895238_2259.jpg', 720, 62)
]);
await jsonFile('src/data/media.json', manifest);
console.log(`Preparando ${images.length} imagens e ${videos.length} vídeos. As conversões completas são reaproveitadas.`);
await Promise.all([pool(images, 3), pool(videos, 1)]);
await prepareOpenGraph(root, seed, manifest);
console.log('Mídia pronta para o build estático.');
