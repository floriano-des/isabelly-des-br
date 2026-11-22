# Verificação da prévia local

22/11/2026 · Branch `v2-redesign` · Astro 7.4.13 · Node 24.19.0.

## Build e conteúdo

- `npm run media` concluiu e passou na reexecução sobre o material preparado. Foram localizados os 201 arquivos do inventário. Os dez vídeos têm MP4, WebM, faixa de áudio e poster.
- `npm run check` terminou com zero erros e zero avisos. `npm run build` gerou as 26 páginas e o sitemap. O índice do Git também foi exportado para uma pasta limpa. Nessa cópia, sem _material, npm ci e npm run build passaram.
- O sitemap lista 22 URLs indexáveis. As rotas de erro, a página de treino e a reserva de migração ficam fora.
- Foram verificados os caminhos locais de mídia, links e imagens responsivas do HTML compilado. Cada imagem de conteúdo tem dimensões explícitas e texto alternativo em seu idioma. Os 24 cartões de compartilhamento têm 1200 × 630.
- O HTML de treino e o currículo entregues têm os mesmos hashes SHA-256 dos arquivos correspondentes da v1.

## Navegação e interação

- A home foi examinada em 375, 768, 1024, 1440 e 1920 px. Os testes incluíram Chrome, Firefox e WebKit. A navegação principal também funcionou sem JavaScript. Retrato, sete links do índice, três destaques, intro por sessão, hover, pausa em touch e movimento reduzido foram verificados.
- Os 14 endereços dos cases foram abertos em PT e EN. A grade, a ficha técnica, as setas, o arraste, o teclado, o som e a pausa de vídeo fora da tela foram exercitados. O próximo case do sétimo abre o primeiro.
- A troca de idioma preserva o projeto atual. No menu mobile, abertura, foco e fechamento por Escape passaram na prévia. O trajeto home → trabalhos → case → case em inglês → contato foi exercitado com movimento normal no Chrome e no Firefox.
- O formulário exibiu os três erros obrigatórios, preservou o texto após falha e limpou os campos após sucesso. As respostas do Formspree foram simuladas no navegador. A entrega real de uma mensagem permanece para homologação.
- No build estático, axe avaliou os critérios automatizáveis WCAG 2 A/AA e 2.1 A/AA na home, Trabalhos, case de marca, case de vídeo, Sobre, Contato e 404 em inglês, em viewport móvel, com zero violações detectadas.
- O emulador local do Cloudflare Pages verificou 71 combinações de endereços legados. Cada solicitação chegou ao destino com um 301 seguido de 200. A rota de treino e seu favicon responderam. Endereços inexistentes retornaram HTTP 404 em português ou, sob /en/, em inglês, inclusive em caminhos de case.

## Lighthouse da home

Lighthouse 13.6 no build estático servido localmente. O perfil móvel usa emulação. Os scripts de analytics são carregados em hosts externos e ficam desativados no localhost.

| Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 92 | 100 | 100 | 100 | 2,20 s | 0,00009 |
| Desktop | 99 | 100 | 100 | 100 | 0,45 s | 0,00029 |

## Homologação pendente

Repetir as medições no endereço publicado com GTM e compressão do provedor. Conferir a entrega real do formulário e testar em aparelhos físicos com iOS Safari e Android Chrome. O WebKit local e a emulação cobrem parte desse percurso. As revisões editoriais e de licença estão em [PENDENCIAS.md](PENDENCIAS.md).
