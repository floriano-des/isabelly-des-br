import { pathFor, type Lang as CaseLanguage, type Project } from './site';
import seed from '../../docs/briefing/projetos.seed.json';
export type { Lang as CaseLanguage, Project as PortfolioProject } from './site';
type Translated<T> = Record<CaseLanguage, T>;

export interface ProjectBlock {
  tipo: string;
  arquivo?: string;
  arquivos?: string[];
  largura?: string;
  cliente?: string;
  titulo?: Translated<string>;
  contexto?: Translated<string>;
  texto?: Translated<string>;
  tags?: Translated<string[]>;
  blocos?: ProjectBlock[];
}

// A listagem e as rotas usam os mesmos JSONs preparados, inclusive durante o recarregamento no dev.
const caseFiles = import.meta.glob<Project>('../content/cases/*.json', {
  eager: true,
  import: 'default',
});

export const projects = seed.cases.map(({ slug }) => {
  const project = caseFiles[`../content/cases/${slug}.json`];
  if (!project || project.slug !== slug) {
    throw new Error(`Case ausente ou com slug incorreto: ${slug}. Execute npm run media.`);
  }
  return project;
}).sort((first, second) => first.ordem - second.ordem);

export function projectUrl(lang: CaseLanguage, slug: string) {
  return pathFor(lang, 'case', slug);
}

export function projectYear(year: string | number) {
  return String(year).includes('(confirmar)') ? undefined : String(year);
}

const sectionNames: Record<string, string> = {
  'Desenhos tradicionais': 'Traditional drawings',
  'Redesign do mascote · Turma do Paiol': 'Mascot redesign · Turma do Paiol',
  'Estampa de formandos': 'Graduation apparel',
  'Capa de livro · Ana Gonçalves': 'Book cover · Ana Gonçalves',
  'Vereador Homerinho': 'Councillor Homerinho',
  'Vereador Francisco Arruda': 'Councillor Francisco Arruda',
};

export function sectionName(name: string, lang: CaseLanguage) {
  return lang === 'en' ? sectionNames[name] ?? name : name;
}
