# Isabelly Lima · Portfólio v2

Portfólio estático bilíngue de design gráfico e ilustração. A v2 usa Astro, GSAP e Lenis. As páginas são renderizadas em HTML e as interações têm suporte a movimento reduzido.

## Executar

Use Node.js 24 LTS e npm. A mídia preparada acompanha o projeto e permite iniciar o servidor ou compilar sem o acervo privado.

```sh
npm ci
npm run dev
```

Abra o endereço local indicado pelo Astro. A home em português fica em `/` e a inglesa em `/en/`. A página privada de treino continua em `/treino`.

```sh
npm run check
npm run build
npm run preview
```

Com o servidor local ativo, `npm run check:work` verifica as duas listagens de Trabalhos e segue os links dos sete cases em cada idioma. Para verificar outro servidor, use `npm run check:work -- http://127.0.0.1:4322`.

## Atualizar trabalhos

Edite [o inventário bilíngue](docs/briefing/projetos.seed.json) e as descrições de mídia em `scripts/media-alt.json`. Para preparar novas peças, instale FFmpeg e FFprobe no PATH e monte o acervo em `_material/isabelly/` e as fotos renomeadas em `_material/fotos/`, conforme a seção 4 do [briefing](docs/briefing/BRIEFING.md). Inclua a foto de infância enviada para o Sobre em `_material/fotos/isabelly-infancia.png`. No acervo `_material/isabelly/`, a foto da estampa fica em `Desenhos e Ilustrações/Ilustrações/Estampa Formandos/esboco.jpg` e a capa da publicação de Isys fica em `Identidade Visual do Site/Instagram/Dfua3aTGy4V.webp`. Execute `npm run media` antes do build. O preparo gera a coleção dos sete cases, variantes responsivas, vídeos, posters e imagens de compartilhamento.

As seis fotos de “Fora do design” ficam em `_material/fotos/fora-do-design/`. Os nomes dos arquivos, a ordem, as legendas e os textos alternativos estão na lista `hobbies` do inventário.

## Revisão

- [Pendências de conteúdo, datas e licenças](docs/PENDENCIAS.md)
- [Origem das imagens e derivados](docs/IMAGENS-GERADAS.md)
- [Verificações da prévia](docs/VERIFICACAO.md)

A branch de trabalho é `v2-redesign`. O workflow prevê Cloudflare Pages para a prévia e a produção, conforme a branch. O envio ao remoto e a publicação dependem de autorização de Floriano.
