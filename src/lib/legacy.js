import seed from '../../docs/briefing/projetos.seed.json' with { type: 'json' };

export const legacySlugs = Object.fromEntries(seed.cases.flatMap(project =>
  project.slugsAntigos.map(oldSlug => [oldSlug, project.slug])
));
export function legacyPath(slug, mapping = legacySlugs) {
  const match = slug && Object.hasOwn(mapping, slug) ? mapping[slug] : slug?.startsWith('video-') ? 'video' : '';
  return match ? '/trabalhos/' + match + '/' : '/trabalhos/';
}
