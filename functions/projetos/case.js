import { legacyPath } from '../../src/lib/legacy.js';

export function onRequest({ request }) {
  const url = new URL(request.url);
  return Response.redirect(new URL(legacyPath(url.searchParams.get('slug')), url), 301);
}
