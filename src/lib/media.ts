import manifest from '../data/media.json';

type Translation = { pt: string; en: string };
type PictureEntry = { kind: 'image'; asset: string; width: number; height: number; widths: number[]; url: string; alt: Translation };
type VideoEntry = { kind: 'video'; src: string; width: number; height: number; webm: string; poster: string; alt: Translation };
export type Media = { kind: 'image' | 'video'; src: string; width: number; height: number; alt: Translation; avifSrcset?: string; srcset?: string; poster?: string; webm?: string };

const items = manifest.items as Record<string, PictureEntry | VideoEntry>;
const assets = import.meta.glob<string>('../assets/**/*.webp', { eager: true, query: '?url&no-inline', import: 'default' });
const prepared = new Map(Object.values(items).map(item => [item.kind === 'image' ? `src/assets/${item.asset}` : item.src, item]));

export function getMedia(original: string): Media {
  const item = items[original] ?? prepared.get(original);
  if (!item) throw new Error(`Mídia ausente do inventário: ${original}`);
  if (item.kind === 'video') return item;
  const src = assets[`../assets/${item.asset}`];
  if (!src) throw new Error(`Mídia não preparada: ${item.asset}. Execute npm run media.`);
  const srcset = item.widths.map((w) => `${w === item.width ? src : `${item.url}-${w}.webp`} ${w}w`).join(', ');
  const avifSrcset = item.widths.map((w) => `${item.url}-${w}.avif ${w}w`).join(', ');
  return { kind: 'image', src, width: item.width, height: item.height, alt: item.alt, srcset, avifSrcset };
}

export const getCover = (slug: string) => getMedia((manifest.covers as Record<string, string>)[slug]);
export const getPhoto = (index: number) => getMedia((manifest.photos as Record<string, string>)[index]);
export const getAboutSlide = (index: number) => getMedia((manifest.slides as Record<string, string>)[index]);
