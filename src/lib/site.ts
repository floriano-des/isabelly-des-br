import pt from '../i18n/pt.json';
import en from '../i18n/en.json';
import { getCollection, type CollectionEntry } from 'astro:content';

export type Lang = 'pt' | 'en';
export type Section = 'home' | 'work' | 'case' | 'about' | 'contact' | 'error';
export const copy = { pt, en };
export type Project = CollectionEntry<'cases'>['data'];
export const projects = (await getCollection('cases'))
  .map((entry) => entry.data)
  .sort((a, b) => a.ordem - b.ordem);
export const email = 'limaisabelly285@gmail.com';
export const socials = {
  Instagram: 'https://instagram.com/bella_designbr',
  Behance: 'https://www.behance.net/isabellylima11',
  LinkedIn: 'https://linkedin.com/in/isabelly-lima-396660263',
};
export const whatsApp = (lang: Lang) =>
  'https://wa.me/5518996505565?text=' + encodeURIComponent(copy[lang].waMessage);
const paths = {
  pt: { home: '/', work: '/trabalhos', about: '/sobre', contact: '/contato', error: '/404' },
  en: { home: '/en/', work: '/en/work', about: '/en/about', contact: '/en/contact', error: '/en/404' },
};
export function pathFor(lang: Lang, section: Section, slug?: string) {
  if (section === 'case') return paths[lang].work + '/' + slug + '/';
  const route = paths[lang][section];
  return route.endsWith('/') || (section === 'error' && lang === 'pt') ? route : route + '/';
}
export function description(lang: Lang, section: Section, project?: Project) {
  const t = copy[lang];
  return {
    home: t.siteDesc,
    work: t.workDesc,
    about: t.aboutDesc,
    contact: t.contactDesc,
    error: t.errorText,
    case: project?.linhaHover[lang],
  }[section];
}
