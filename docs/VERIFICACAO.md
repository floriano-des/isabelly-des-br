# Verificação da prévia local

22/11/2026 · Branch `v2-redesign` · Astro 7.4.13 · Node 24.19.0.

## Build e conteúdo

- `npm run media` concluiu com os 200 arquivos de origem dos sete cases, sendo 190 imagens e dez vídeos. Os dez vídeos têm MP4, WebM, faixa de áudio e poster.
- `npm run check` terminou com zero erros e zero avisos. `npm run build` gerou as 26 páginas e o sitemap. O índice do Git também foi exportado para uma pasta limpa. Nessa cópia, sem _material, npm ci e npm run build passaram.
- O sitemap lista 22 URLs indexáveis. As rotas de erro, a página de treino e a reserva de migração ficam fora.
- Foram verificados os caminhos locais de mídia, links e imagens responsivas do HTML compilado. Cada imagem de conteúdo tem dimensões explícitas e texto alternativo em seu idioma. Os 24 cartões de compartilhamento têm 1200 × 630.
- O HTML de treino e o currículo entregues têm os mesmos hashes SHA-256 dos arquivos correspondentes da v1.

## Navegação e interação

- A home foi examinada em 375, 768, 1024, 1440 e 1920 px. Os testes incluíram Chrome, Firefox e WebKit. A navegação principal também funcionou sem JavaScript. Retrato, sete links do índice, três destaques, intro por sessão, hover, pausa em touch e movimento reduzido foram verificados.
- A seção de destaques da home usa os cartões de Trabalhos para Vanessa Rosa, Isys Karoline e Social Media, com acesso à listagem completa na quarta célula. O Chrome confirmou a mesma largura de capa e disposição dos cartões nas duas páginas em 375, 820, 1024 e 1440 px, nos dois idiomas, com e sem JavaScript. O teste por teclado abriu o case a partir da home, retornou à grade e seguiu para a lista completa.
- Os 14 endereços dos cases foram abertos em PT e EN. Foram testados os links da grade, a ficha técnica por teclado, o controle de som e a pausa de vídeo fora da tela. O próximo case do sétimo abre o primeiro.
- Em Social Media, as 114 peças estão na ordem do inventário em 21 carrosséis horizontais. O Chrome verificou controles, contador, teclado, arraste com mouse, gesto de toque e rolagem nativa sem JavaScript em PT e EN, a 375 e 1440 px. No desktop, o contador indica a primeira das duas peças visíveis.
- As 12 pranchas de Vanessa Rosa mediram 375 px no celular de 375 px, 1365,13 px na tela de 1440 px e 1400 px na tela de 1920 px. O intervalo entre pranchas foi de 4, 7,92 e 8 px nos três tamanhos.
- Em PT e EN, o case de Isys Karoline abriu com o crachá sobre fundo azul, e a prancha de referências veio antes da paleta. A seção Fale Seguro de Material Gráfico exibiu as sete imagens selecionadas.
- A seção Estampa de formandos abre com o esboço a lápis, seguido pelos dois mockups nas URLs já publicadas. Os três primeiros slides do Instagram foram comparados às publicações do perfil. Cada card do Sobre exibe a capa correspondente inteira (1080 × 1350 px).
- No CTA da home, o tamanho computado da fonte do e-mail passou de 86,4 para 72,96 px na tela de 1920 px.
- O Sobre apresenta a foto de infância como colagem e oferece cinco atalhos. Em PT e EN, os blocos de experiência profissional, formação acadêmica e cursos exibem quatro experiências, uma graduação e cinco cursos do trecho indicado do currículo. A navegação pelas âncoras passou em 320, 390, 820 e 1440 px, inclusive sem JavaScript em 320 px. No WebKit, os atalhos de experiência e formação alcançaram os títulos por toque e teclado, e o histórico funcionou com Voltar e Avançar. O axe passou no conteúdo do Sobre em 390 e 1440 px.
- Os três cards de @bella_designbr têm a legenda “ver post” em PT e “view post” em EN. Na ordem da página, os destinos são [branding](https://www.instagram.com/p/DbI83krAAL0/), [Isys Karoline](https://www.instagram.com/p/Dfua3aTGy4V/) e [fundamentos do design](https://www.instagram.com/p/DcEWmpgkT9d/).
- A troca de idioma preserva o projeto atual. No menu mobile, abertura, foco e fechamento por Escape passaram na prévia. O trajeto home → trabalhos → case → case em inglês → contato foi exercitado com movimento normal no Chrome e no Firefox.
- O formulário exibiu os três erros obrigatórios, preservou o texto após falha e limpou os campos após sucesso. As respostas do Formspree foram simuladas no navegador. A entrega real de uma mensagem permanece para homologação.
- No build estático, axe avaliou os critérios automatizáveis WCAG 2 A/AA e 2.1 A/AA na home, Trabalhos, case de marca, case de vídeo, Sobre, Contato e 404 em inglês, em viewport móvel, com zero violações detectadas.
- O emulador local do Cloudflare Pages verificou 71 combinações de endereços legados. Cada solicitação chegou ao destino com um 301 seguido de 200. A rota de treino e seu favicon responderam. Endereços inexistentes retornaram HTTP 404 em português ou, sob /en/, em inglês, inclusive em caminhos de case.

## Lighthouse da home

Lighthouse 13.6 no build estático servido localmente. O perfil móvel usa emulação. Os scripts de analytics são carregados em hosts externos e ficam desativados no localhost.

| Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 95 | 100 | 100 | 100 | 2,45 s | 0 |
| Desktop | 99 | 100 | 100 | 100 | 0,55 s | 0,00025 |

## Regressão na listagem de Trabalhos

A prévia de desenvolvimento chegou a responder HTTP 200 nas listagens com apenas o bloco de contato e HTTP 404 nos detalhes, embora o build estático tivesse os sete cases. As rotas e o grid passaram a importar os JSONs preparados em `src/content/cases/`, com verificação dos slugs do inventário. A falta de um arquivo agora identifica o case no erro de compilação.

Com a prévia aberta, execute `npm run check:work`. O teste lê o HTML recebido nas listagens PT e EN, confere a ordem dos sete links, abre cada destino e verifica a página equivalente no outro idioma. O teste também abre o maior AVIF de cada capa do grid e compara as dimensões do arquivo com as do srcset. Passou tanto na prévia de desenvolvimento quanto no build estático; para testar este último, passe o endereço de `npm run preview` como argumento.

No Chrome a 1440 px com densidade 2×, as sete capas agora selecionam arquivos de 800 × 800 para células de 359 px. No celular a 375 px e 3×, seis capas selecionam 1280 × 1280. A de Vanessa Rosa chega a 800 × 800, o maior quadrado disponível no original de 1400 × 800. A capa do case Vídeo usa três frames extraídos dos reels em resolução nativa.

O percurso Home → Trabalhos → case → outro idioma → voltar ao grid foi verificado em desktop e celular emulado com movimento ativo. O grid preservou o alinhamento das linhas nas larguras de 320 a 1920 px, inclusive no tablet horizontal com toque.

## Homologação pendente

Repetir as medições no endereço publicado com GTM e compressão do provedor. Conferir a entrega real do formulário e testar em aparelhos físicos com iOS Safari e Android Chrome. O WebKit local e a emulação cobrem parte desse percurso. As revisões editoriais e de licença estão em [PENDENCIAS.md](PENDENCIAS.md).
