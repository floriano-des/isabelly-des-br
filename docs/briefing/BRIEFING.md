# Briefing — isabelly.des.br v2

**Executor:** Codex com ChatGPT 6.2 Astra
**Responsável técnico:** Floriano Silva (aprova commits enviados, merges e deploy)
**Cliente final:** Isabelly Lima, designer gráfica e ilustradora
**Data:** 22/11/2026

Este documento é a especificação completa do redesign. Ele foi escrito para ser executado sem precisar de quem o escreveu: tudo o que você precisa decidir está decidido aqui, ou está marcado como liberdade sua ou como pendência.

---

## 0. Como usar este briefing

### 0.1 Ordem de leitura
1. `AGENTS.md`: regras de operação.
2. Este arquivo, inteiro, antes de escrever código.
3. `projetos.seed.json`: inventário de conteúdo (cases, mídias, textos PT/EN, layout de cada bloco).
4. `referencias/`: capturas a 1440px das 4 referências escolhidas pelo cliente (`capturas/`) e os prints que ele mesmo enviou (`prints-do-cliente/`).
5. O material da Isabelly (zip + fotos), depois de extraído conforme a seção 4.

### 0.2 Fontes de verdade, em ordem de prioridade
1. As decisões deste briefing.
2. O material do zip (é a fonte principal de conteúdo; o que não está no zip não entra no site).
3. Os textos do site atual (`projetos.js`, `index.html`, `sobre.html`, `contato.html` do repositório).
4. Os rascunhos do `projetos.seed.json` (marcados como `rascunho — validar com a Isabelly`).

### 0.3 O que é fixo e onde você tem liberdade
- **Fixo:** estrutura de páginas, agrupamento de projetos, comportamento de cada referência (seções 7 a 9), identidade visual (seção 5), stack, idiomas, regras de imagem (seção 13).
- **Liberdade sua:** detalhes de espaçamento e de tempos de animação dentro das faixas dadas, nomes de componentes e arquivos, organização interna do código, e as micro-interações que não contradizem nada aqui.
- **Pendências:** a seção 20 lista o que depende da Isabelly. Implemente com o rascunho e deixe cada pendência anotada em `docs/PENDENCIAS.md`.

---

## 1. Contexto

**Quem é:** Isabelly Lima ("pode me chamar de Isa ou de Bella"), designer gráfica e ilustradora de Palmital, interior de São Paulo. Freelancer desde 2023, trabalhou principalmente com social media e design de posts, atua na Agência Dolivs e hoje se especializa em branding e identidade visual. Instagram: `@bella_designbr`.

**Por que refazer:** o site atual (HTML estático + jQuery, tema escuro genérico com roxo) é simples demais para a quantidade e a qualidade do trabalho dela. A v2 precisa ter acabamento de site premiado, animações de primeira e a personalidade dela, que é forte e muito própria (gótico romântico, gatos, terror psicológico, Coraline, colagem de papelaria).

**Objetivo do site:**
1. Mostrar o trabalho com impacto e organização clara.
2. Transmitir quem ela é (a identidade gótica dela é um diferencial, não um enfeite).
3. Converter em contato: WhatsApp, e-mail e formulário.

**Público:** pequenas e médias empresas, profissionais liberais e agências parceiras, no Brasil e no exterior (ela já atende clientes na Irlanda). Por isso o site é bilíngue.

**Tom de voz:** primeira pessoa, próxima e confiante, com o humor dela ("Sukito faz jus à cor, tira minha paz") sem perder o profissionalismo. Frases curtas. Nada de jargão de agência.

---

## 2. Decisões fechadas

| Tema | Decisão |
|---|---|
| Páginas | Home, Trabalhos, Case (template), Sobre, Contato, 404. `/treino` preservada (ver 4.4). |
| Home | Inspirada em **zhenyary.com**: entrada animada, hero com nome partido em volta da foto, lettering de serviços, trabalhos selecionados em tela dividida. |
| Trabalhos | Grid do **studioherrstrom.com/work** (2 projetos por linha, blocos separados, capa + painel) com o hover de **nvmbr.in** (capa desfoca e abre caixa de cor forte com nome, descrição e tags). |
| Case | Estrutura do case **andwalsh.com/work/all/lex**: capa, resumo em letra grande, mídias grandes uma por linha (verticais em pares), frases de complemento entre as mídias. |
| Agrupamento | Cada **marca** é um case (Vanessa Rosa, Isys Karoline, Brucutu). **Social Media**, **Material Gráfico**, **Vídeo** e **Ilustração** são um case cada, com tudo junto. Total: 7 cases. |
| Cursor | Gatinho (mascote da identidade), recortado com o módulo de imagem. |
| Stack | Astro (estático) + GSAP (ScrollTrigger, SplitText) + Lenis. |
| Idiomas | PT (padrão) + EN, com seletor. |
| Deploy | Cloudflare Pages, pelo GitHub Action que já existe (ajustado para build do Astro). |
| Analytics | Manter o GTM `GTM-PJGH2MT6` (GA4 e Clarity entram por ele). |
| Formulário | Manter o Formspree atual: `https://formspree.io/f/mzdjqaeg`. |
| Imagens com IA | Recortes, tratamento das fotos dela, upscale e composições ficam com o seu módulo de geração/edição de imagem, dentro das regras da seção 13. |

---

## 3. O que muda da v1 (para orientar, não para copiar)

| Hoje | Na v2 |
|---|---|
| Hero centralizado com "✦ Designer Gráfica ✦" e foto recortada em círculo | Hero com entrada animada, nome em gótica partido em volta da foto, linhas de grid e círculos |
| Grade de miniaturas com vãos e filtro por categoria | Grid de blocos 2 por linha com hover blur + caixa de cor |
| Case com um parágrafo e imagens soltas | Case narrativo: capa, resumo grande, mídias grandes, frases, ficha técnica, próximo case |
| Partículas, ondas e WOW.js sem fio condutor | Um sistema de movimento só (seção 11) |
| Roxo genérico | A identidade que a própria Isabelly definiu (seção 5) |
| 19 projetos, vários sem material bom | 7 cases fortes vindos do zip |

---

## 4. Setup (você faz)

### 4.1 Repositório
- Repositório: `https://github.com/floriano-des/isabelly-des-br` (branch padrão `master`).
- Pasta de trabalho: `C:\Users\flori\Projects\freelas\isabelly-des-br`. Ela já contém `briefing-codex/` (este briefing), `curadoria/` (uma curadoria de referências feita antes, só contexto) e `.claude/` (configuração local; não mexa).
- Como a pasta não está vazia, inicialize assim:
  ```
  git init
  git remote add origin https://github.com/floriano-des/isabelly-des-br.git
  git fetch origin
  git checkout -b v2-redesign origin/master
  ```
- Mova `briefing-codex/` para `docs/briefing/` e `briefing-codex/AGENTS.md` para a raiz do repositório.
- `.gitignore`: acrescente `_material/`, `docs/briefing/referencias/`, `.claude/settings.local.json`, `node_modules/`, `dist/`, `.astro/`.
- Todo o trabalho acontece na branch `v2-redesign`. Pode fazer commit por marco. **Não faça push, merge em `master` nem deploy de produção sem autorização do Floriano.**

### 4.2 Material da Isabelly (fica fora do git)
- Zip: `C:\Users\flori\Downloads\Site Isabelly-20261122T200403Z-1-001.zip` (481 MB, 244 arquivos, nomes em UTF-8).
  Extraia de forma que o conteúdo da pasta `Site Isabelly/` fique em `_material/isabelly/`. Exemplo: `_material/isabelly/Marcas/Identidade Visual - Manicure Vanessa Rosa/PAG 1.jpg`.
  Todos os caminhos do `projetos.seed.json` são relativos a `_material/isabelly/`.
- Fotos da Isabelly: 6 arquivos `C:\Users\flori\Downloads\WhatsApp Image 2026-11-22 at 17.11.0*.jpeg`. Copie para `_material/fotos/` com os nomes novos listados em `fotos.itens` do seed.
- O que tem no zip:
  - `Marcas/`: as 3 identidades.
  - `Social Media/`: 8 clientes.
  - `Impressos/`: Fale Seguro, AmarElo e a capa de livro.
  - `Vídeos/`: 2 Palitos e Zen Pensions.
  - `Desenhos e Ilustrações/`.
  - `Identidade Visual do Site/`: paleta, mascote, texturas e 3 carrosséis "sobre mim" que definem a linguagem visual.

### 4.3 Projeto Astro
- Substitua o site estático antigo pelo projeto Astro na mesma branch. O histórico do git preserva a v1.
- Node LTS atual, Astro na última versão estável. Dependências mínimas: `gsap`, `lenis`, `@astrojs/sitemap`, `sharp`. Evite frameworks de UI: componentes `.astro` e TypeScript bastam.
- Scripts: `dev`, `build`, `preview`, `media` (preparação de mídia, seção 14).

### 4.4 O que preservar da v1
- `treino.html` ("Treino da Isabelly", página privada com `noindex`): copie sem alterar para `public/treino.html`. Ela continua respondendo em `/treino`, fora do menu e fora do sitemap.
- `media/Currículo Isabelly Lima.pdf` → `public/cv/isabelly-lima-curriculo.pdf` (link "Baixar CV" no Sobre).
- `robots.txt` (atualize a URL do sitemap) e os favicons, que devem ser refeitos com o gatinho.
- O restante da v1 (CSS, jQuery, mídias de projetos que não estão no zip) sai.

---

## 5. Identidade visual

A Isabelly mandou a identidade que quer usar na pasta `Identidade Visual do Site/`. Estude os 3 carrosséis "sobre mim" (`Carrossel 1 (sobre mim)`, `Carrossel 2`, `Carrossel 3`) antes de desenhar qualquer coisa: eles são o manual de marca na prática.

### 5.1 Conceito
**Gótico romântico de papelaria.** Fundos roxo-noite com damask, tartan preto, papel amassado e papel pautado rasgado, polaroides presas com fita, selos postais, ilustrações vintage em gravura (esqueleto, besouro, morcego, rosas, aranhas, caveiras), títulos em letra gótica, palavras destacadas com caixa roxa atrás, sublinhados e anotações manuscritas. A mascote é um gatinho preto (só a cabeça, olhos brancos triangulares).

A régua de acabamento é a das referências (seção 21). O site é sofisticado e animado como um site premiado, com a linguagem dela por cima. Use os elementos de papelaria com moderação: eles temperam, não decoram cada canto.

### 5.2 Paleta (tokens)
Amostrada de `Paleta de cores/Paleta roxa.jpg` e dos carrosséis:

| Token | Hex | Uso |
|---|---|---|
| `--noite-profunda` | `#13071D` | fundo principal do site |
| `--noite` | `#1D082F` | superfícies, painéis do grid, fundo alternado (da paleta) |
| `--ameixa` | `#4E2A72` | roxo da marca: cortina de transição, blocos, gato em versão roxa (da paleta) |
| `--roxo-carrossel` | `#452067` | fundos de seção, como nos carrosséis |
| `--violeta` | `#7F52AD` | destaques e caixas de palavra destacada; para texto, só em tamanho grande |
| `--eletrico` | `#8B3DFF` | caixa do hover dos cases, foco, botões. Derivado do roxo da marca, saturado para ter contraste forte. Texto branco sobre ele passa no AA. |
| `--lavanda` | `#C7C7D1` | texto secundário, linhas, superfícies claras (da paleta) |
| `--papel` | `#E5D8D3` | notas de papel (fundo de cards de texto no Sobre) |
| `--texto` | `#F1ECF4` | texto principal sobre `--noite-profunda` |
| `--preto` | `#000000` | intro, tartan, gato |

Tema único escuro. Não crie modo claro.

### 5.3 Tipografia
Os carrosséis usam três famílias: uma **gótica** nos títulos de impacto ("Antes", "Playlist", "Babys", "No meu tempo livre"), uma **sans geométrica** no texto (parecida com Century Gothic / Glacial Indifference) e uma **manuscrita** nas anotações. O nome exato e os arquivos estão pendentes (seção 20). Até lá:

| Papel | Escolha | Uso |
|---|---|---|
| Display gótica | Teste UnifrakturCook 700, Grenze Gotisch 800–900 e Pirata One lado a lado com o slide 3 do Carrossel 1 ("Antes") e escolha a mais próxima | nome no hero, lettering de serviços, títulos de case, nome dos clientes nas seções, "Próximo case" |
| Sans geométrica | Glacial Indifference (self-host; confira a licença no pacote) ou, se não puder, Questrial / Urbanist | texto corrido, UI, resumos, frases |
| Serif itálica (acento) | Cormorant Garamond Italic 500 | **só** em duas situações: o item com blur do lettering e a palavra de ênfase do CTA final |
| Manuscrita | a mais próxima das anotações dos carrosséis (teste Reenie Beanie e Caveat) | anotações, legendas de polaroide, item sublinhado do lettering |
| Mono | IBM Plex Mono 400/500 | tags do hover, metadados, contadores, rótulos |

Escala fluida (referência 1440px):
- Display hero: `clamp(64px, 7.6vw, 150px)`
- Lettering: `clamp(32px, 3.6vw, 64px)`
- Título de case: `clamp(36px, 3.2vw, 56px)`
- Resumo e frases: `clamp(22px, 2.4vw, 40px)`, line-height 1.3
- Texto: 17–18px, line-height 1.6
- Rótulos: 12–13px em caixa-alta, tracking `.08em`
- Tags mono: 11px

Fontes em woff2, self-host, `font-display: swap`, com preload só da display e da sans. Toda família precisa de uma pilha de fallback real.

### 5.4 Texturas (`Texturas/`)

| Arquivo | Uso |
|---|---|
| `1283323_381.jpg`, `11408184_49855.jpg` (damask escuro) | sobreposição global sutil sobre `--noite-profunda` (opacidade 6–10%, `mix-blend-mode: soft-light`), como tile |
| `1534419_816.jpg` (damask preto e cinza) | fundo do bloco CTA e do 404 |
| `black-tartan-check-background (1).jpg` | faixas de destaque, bloco CTA do grid, rodapé |
| `895238_2259.jpg` (papel branco amassado), `893146_57934-O94E04-714.jpg` (kraft), `711276_18.150p-01.jpg` (papel) | notas de papel no Sobre |
| `9641042_15070.jpg` (damask cinza claro) | reserva |

Redimensione todas para tiles de no máximo 1600px em WebP (cerca de 100 KB cada). Duas delas têm o texto "designed by freepik": não remova marca d'água com IA. Use um recorte sem o texto, ou outra textura, e mantenha o crédito "Texturas: Freepik" no colofão do rodapé (veja a pendência da licença).

### 5.5 Mascote (`Mascote/`)
- `Logo Preta.png` (596×611, gato preto sobre branco): forma de referência.
- `pfp Sem stroke.jpg` e `pfp com stroke.jpg` (1770px, gato sobre damask roxo): avatar.
- Produza, com o módulo de imagem, a cabeça do gato em fundo transparente e vetorize **fielmente**, sem redesenhar a forma. Versões: preta, ameixa, lavanda e preta com contorno branco.
- Usos: logo do header (gato + "Isabelly Lima"), cursor (seção 12), favicon e ícones, selo girando, cortina de transição, CTA do grid, 404.

### 5.6 Linguagem gráfica dos carrosséis aplicada ao site
- **Palavra destacada:** caixa `--violeta` atrás da palavra (padding `.05em .25em`), como em "solucionar problemas". No máximo uma por bloco de texto.
- **Sublinhado:** traço de 2px que se desenha da esquerda para a direita ao entrar na tela.
- **Ênfase:** negrito e itálico da sans ("Isa", "Bella").
- **Notas de papel:** cards com textura de papel, bordas rasgadas (máscara PNG/SVG), leve rotação (±2°) e fita adesiva translúcida.
- **Polaroides:** moldura branca com legenda manuscrita, rotação ±4°, fita.
- **Adesivos de gravura:** esqueleto, besouro, morcego, rosa e aranha, criados como PNGs originais no estilo dos carrosséis (seção 13). Uso pontual: Sobre, 404 e cantos de seção.
- Não use frames de filmes (Coraline e outros aparecem nos carrosséis 2 e 3): são obras de terceiros.

---

## 6. Arquitetura e rotas

| PT | EN | Página |
|---|---|---|
| `/` | `/en/` | Home |
| `/trabalhos` | `/en/work` | Trabalhos |
| `/trabalhos/[slug]` | `/en/work/[slug]` | Case (7 slugs do seed) |
| `/sobre` | `/en/about` | Sobre |
| `/contato` | `/en/contact` | Contato |
| `/404` | `/en/404` | Erro |
| `/treino` | (não tem) | preservada da v1 |

**Header** (um componente, em todas as páginas):
- Logo à esquerda: gato + "Isabelly Lima" na sans.
- Navegação no estilo da Zhenya, com cada item em duas linhas (rótulo em 16–18px e sublegenda em caixa-alta de 9–10px): "Sobre / quem sou eu", "Trabalhos / meus cases", "Serviços / o que eu faço" (âncora `/#servicos`) e "Contato / vamos conversar".
- Seletor PT / EN.
- Some ao rolar para baixo e volta ao rolar para cima.
- Em páginas de case fica sobre a capa, com o degradê da seção 9.

**Menu mobile:** overlay em tela cheia `--ameixa` com os itens em gótica grande, o gato e os links de redes.

**Rodapé:** CTA (seção 7.4, versão compacta fora da home), contatos, redes, relógio de Palmital, colofão ("Desenvolvido por Floriano Silva", link para floriano.des.br; crédito das texturas) e © 2026.

---

## 7. Home (referência: zhenyary.com)

O cliente gostou de: **a home, a animação de entrada, como os projetos estão distribuídos e o lettering com os serviços**. Veja `referencias/capturas/zhenya-*.jpg` (frames `entrada-a` a `g`, hero e rolagem).

### 7.1 Entrada animada
Duração total de cerca de 3,2s. Medido na referência: transições do nome com 1s e `cubic-bezier(.25,.46,.45,.94)`.

| Tempo | O que acontece |
|---|---|
| 0,0s | Tela preta cheia (`--preto`), por cima de tudo. |
| 0,2–1,0s | "Oi!" (EN: "Hey!") em gótica, cerca de 6vw, cor `--lavanda`, entra de baixo (y 40px→0, opacidade 0→1, 0,6s, `power3.out`) no terço inferior esquerdo. Ao lado, duas bolinhas de cerca de 4,5vw (uma `--violeta`, outra `--lavanda`) que quicam e trocam de lugar. Palavra e bolinhas sobem juntas até o meio da tela (frames `b` e `c`). |
| 1,0–1,8s | As bolinhas se multiplicam em 12–16 círculos de tamanhos variados, na cor do fundo do hero (`--noite-profunda` com a textura damask), que crescem e cobrem a tela inteira como bolhas (frame `d`). O "Oi!" some. |
| 1,8–2,6s | Os círculos viram o fundo do hero e revelam a foto central (scale 1,08→1 com `clip-path` abrindo do centro), as linhas de grid (vertical com scaleY 0→1, horizontal com scaleX 0→1, a partir do centro), três círculos concêntricos (scale 0,4→1, opacidade 0→1, stagger 0,1s) e a numeração 01–07 (y 20px→0, stagger 0,05s). |
| 2,4–3,2s | "Isabelly" desliza de trás da foto para a esquerda e "Lima" para a direita (1s, curva acima). Header e barra inferior entram (y −10px→0, fade). O selo do gato aparece girando. |

Regras:
- Na mesma sessão, a intro roda uma vez só (`sessionStorage`); nas visitas seguintes, versão curta de 0,6s com o fundo e o nome.
- Com `prefers-reduced-motion`, sem intro: o hero aparece no estado final.
- O HTML do hero é completo desde o servidor. A intro é uma camada visual removida do DOM ao terminar, e nada fica com `opacity: 0` esperando JS se o script falhar.

### 7.2 Hero (estado final)
- Fundo `--noite-profunda` com o damask a 8%.
- Uma linha vertical e uma horizontal de 1px (`--lavanda` a 15%) cruzando no centro, mais um círculo grande de contorno (cerca de 46vw, 1px, `--lavanda` a 15%) centralizado.
- Numeração 01–07 em mono pequeno (`--lavanda` a 50%) distribuída na linha horizontal. São 7 porque são 7 cases; cada número leva ao case correspondente no hover/clique.
- **Foto central:** cerca de 21vw × 23vw (proporção ~0,9), a partir de `isabelly-01-damask-roxo.jpg` tratada (seção 13).
- **Hover na foto:** a imagem troca entre 4 imagens conforme a posição horizontal do mouse (a foto e os recortes das capas de Vanessa Rosa, Isys e Social Media), com corte seco como na referência. Em touch, alterna sozinha a cada 1,5s quando visível.
- **Nome:** "Isabelly" à esquerda e "Lima" à direita da foto, na display gótica (`clamp(64px, 7.6vw, 150px)`, `--texto`), centralizados na vertical e invadindo um pouco a borda da foto, como na referência.
- **Parallax de mouse:** foto ±12px no sentido oposto, nome ±20px, círculos ±6px, com suavização (lerp ~0,08, `gsap.quickTo`).
- **Esquerda, abaixo:** "VER TRABALHOS ↓" em caixa-alta pequena, rolando até os trabalhos selecionados.
- **Direita, abaixo da foto:** selo do gato girando (texto circular "CLIQUE · MIAU · CLIQUE · MIAU ·", EN "CLICK · MEOW ·", 12s por volta), que leva ao Sobre. Abaixo dele, três disciplinas em 18px: "Identidade visual / Social media / Ilustração".
- **Barra inferior:** "PALMITAL · SP" com o relógio local ao vivo (America/Sao_Paulo) à esquerda; Instagram, Behance e LinkedIn no centro; PT / EN à direita.

### 7.3 "O que eu faço" (lettering de serviços), âncora `#servicos`
Medido na referência: 3 linhas em serifa grande (cerca de 3,4vw), palavras quebradas letra a letra, cada letra começando com `opacity: 0; transform: translateX(50px)`, uma estrela entre os itens, um item em itálico com blur, um em itálico sublinhado e "&&" entre os dois últimos. Versão da Isabelly:

```
Identidade visual   ✦   Social media
Branding            Material gráfico
Ilustração   &&   Vídeo
```

EN: `Visual identity ✦ Social media / Branding · Print design / Illustration && Video`.

| Item | Tratamento |
|---|---|
| Identidade visual, Material gráfico, Ilustração, Vídeo | display gótica, letra a letra |
| ✦ | SVG de estrela de 8 pontas na cor `--violeta`; entra com opacidade 0→1 e rotação 180°→0 |
| Social media | serif itálica com blur: duas camadas do mesmo texto, uma nítida e uma desfocada (`filter: blur(12px)`) que pulsa a opacidade entre 0,2 e 0,6 (3s, yoyo, infinito) |
| Branding | manuscrita, com sublinhado em SVG que se desenha (`stroke-dashoffset`, 0,9s) depois das letras |
| && | dois "&" na display; o segundo entra deslocado e gira até encaixar |

- **Animação:** ScrollTrigger com `start: "top 75%"`. Letras vão para opacidade 1 e x 0 em 0,8s com `power3.out` e stagger de 0,025s; as linhas entram com 0,15s de diferença.
- **Rótulo acima:** "O QUE EU FAÇO" em caixa-alta de 12px.
- **Acessibilidade:** uma `<ul>` real com os serviços, escondida visualmente (`sr-only`), e a versão animada com `aria-hidden="true"`, exatamente como a referência faz.

### 7.4 Trabalhos selecionados (tela dividida)
Os 3 cases em `home.destaques` do seed: Vanessa Rosa, Isys Karoline e Social Media. Na referência, cada projeto ocupa cerca de uma tela, dividida em duas colunas (veja `zhenya-scroll-2` a `4`).

- **Coluna esquerda:** imagem vertical (recorte retrato da capa) com cerca de 25vw de largura, centralizada; nome do projeto na display, sobreposto à base da imagem; legenda pequena abaixo ("Identidade visual · 2026").
- **Emenda central:** a inicial gigante do projeto com ponto ("V.", "I.", "S.") na display (cerca de 9vw), atravessando as duas colunas.
- **Coluna direita:** rótulo "TRABALHOS SELECIONADOS" (só no primeiro), nome em 24px, disciplinas em caixa-alta separadas por " / ", descrição curta (`linhaHover` do seed) e o link "Ver case +" com sublinhado animado. Embaixo, uma segunda imagem horizontal sangrando até a borda e um bloco de cor na `corMarca` do case atrás de parte da coluna (na referência é o bloco laranja).
- **Scroll:** imagens com parallax (y −8% → 8%), bloco de cor entrando com scaleY 0→1 a partir da base, inicial com leve deslocamento.
- **Depois dos 3:** link centralizado gigante "Todos os trabalhos" (display, cerca de 6vw, sublinhado; EN "All work") para `/trabalhos`, como o "All cases here" da referência.

### 7.5 CTA final
Como o fim da referência ("Let's make something *great*!" + e-mail gigante):
- "Vamos criar algo *incrível* juntos?" com "incrível" na serif itálica, cerca de 5vw. O texto vem do site atual.
- E-mail `limaisabelly285@gmail.com` gigante em `--violeta` (cerca de 4,5vw). O clique copia para a área de transferência e mostra o toast "E-mail copiado".
- WhatsApp `+55 18 99650-5565` (`https://wa.me/5518996505565` com mensagem pronta), redes e o gato pequeno.

---

## 8. Trabalhos (referências: studioherrstrom.com/work + nvmbr.in)

Do Herrström, o cliente gostou de: **como os blocos estão separados, a capa de cada projeto e a disposição em grid com dois projetos por linha a cada rolagem, no desktop**. Do November, gostou do **efeito de blur no hover junto com a descrição do projeto, numa caixa de cor contrastante bem forte**. Veja `herrstrom-work-*.jpg`, `november-*.jpg` e `prints-do-cliente/november-*.webp`.

### 8.1 Topo
- Rótulo "TRABALHOS".
- Manchete em até 2 linhas, misturando sans e gótica como o "SH-MIX" do Herrström (cerca de 64px a 1440px): "Marcas, social media, impresso, vídeo e ilustração. *Sete projetos*, um jeito de pensar." EN: "Brands, social media, print, video and illustration. *Seven projects*, one way of thinking."
- Parágrafo curto opcional. Sem filtros: são 7 entradas.

### 8.2 Grid (medido na referência)
- Sangra a tela inteira, sem margens laterais. 4 colunas iguais (25vw), células quadradas (360px a 1440px) e linhas divisórias de 1px (`--lavanda` a 14%) entre as células.
- Cada linha tem **2 projetos**, e cada projeto ocupa **2 células: capa + painel**. Linhas ímpares: `capa | painel | capa | painel`. Linhas pares: `painel | capa | painel | capa` (xadrez).
- Ordem: o campo `ordem` do seed (01 Vanessa Rosa, 02 Isys Karoline, 03 Brucutu, 04 Social Media, 05 Material Gráfico, 06 Vídeo, 07 Ilustração).
- A 4ª linha tem o projeto 07 e um **bloco CTA** de 2 células: tartan preto com o gato numa célula e, na outra, o painel "Tem um projeto em mente? Vamos conversar →", que leva a `/contato`.

### 8.3 Painel
- Fundo `--noite`, padding 1,6vw.
- Topo esquerdo: número "01" e categoria em mono 11px caixa-alta (`--lavanda` a 60%).
- Topo direito: o gato pequeno em contorno.
- Base: nome do projeto em sans 1,6vw e ano, mais a seta "→".
- **Seta (Herrström):** duas setas empilhadas; no hover do bloco, a primeira gira 90° no eixo X e sai, e a segunda gira de −90° para 0° e entra (`rotate3d(1,0,0,…)`, 0,45s).

### 8.4 Hover da capa (medido no November)
O hover vale para o projeto inteiro (capa e painel ativam o mesmo efeito na capa).
- **Imagem:** `transform: scale(1.08)` + `filter: blur(28px) saturate(1.2)`, 0,5s, `cubic-bezier(.22,1,.36,1)`. A imagem fica dentro de `overflow: hidden`, então o scale esconde a borda clara do blur.
- **Caixa:**
  - `position: absolute; top: 12px; left: 12px; width: 80%`, padding `14px 16px 16px`.
  - Fundo `--eletrico` com texto branco. Quando o case tiver `hoverBox` no seed, use essa cor; Social Media usa `#C7C7D1` com texto `--noite`, porque a capa dele já é roxa.
  - Entra com fade e y 6px→0 em 0,5s.
- **Conteúdo da caixa:**
  - Título em negrito, 18px.
  - `linhaHover` em 16px/1,35.
  - Tags (`tags` do seed) em mono 11px, altura 22px, padding `0 7px`, borda de 1px em `currentColor` a 55%, fundo `rgba(0,0,0,.15)`, raio 3px, gap 7px.
- **Cursor:** o gato com o rótulo "ver case".
- **Clique:** abre o case com a transição de elemento compartilhado: a capa vira a capa do case (`transition:name="capa-{slug}"`, seção 11).

### 8.5 Responsivo
- **Tablet (768–1023px):** 1 projeto por linha (capa | painel, 50/50).
- **Mobile (<768px):** capa quadrada de 100vw e painel abaixo. No mobile o painel mostra também a `linhaHover` e as tags (não há hover).

---

## 9. Case (referência: andwalsh.com/work/all/lex)

O cliente gostou da página interna de projeto, nesta ordem:
1. Uma capa.
2. Um pequeno resumo com letras grandes.
3. As imagens do projeto, uma por linha, bem grandes e em boa resolução (GIF/vídeo ou imagem fixa).
4. Imagens verticais podem ir em pares na mesma linha.
5. Entre as imagens, quando necessário, uma frase curta de complemento.

Veja `andwalsh-lex-01` a `17` e `prints-do-cliente/andwalsh-lex-*.png|webp`. Medidas a 1440px na referência:
- margens laterais de cerca de 37px (2,6vw);
- capa de 1352×761 (16:9);
- título com 46px numa coluna de cerca de 30%;
- resumo com 34px numa coluna de cerca de 63%;
- frases centralizadas com 34px em cerca de 84% da largura.

### 9.1 Estrutura
- **Gutter:** `--gutter: max(16px, 2.6vw)`.
- **Header sobre a capa:** degradê no topo (`linear-gradient(to bottom, var(--noite-profunda), transparent)`, cerca de 140px de altura) para garantir leitura, como nos prints do Lex.
- **Capa:**
  - Largura do conteúdo, proporção 16:9, `object-fit: cover`.
  - Usa a imagem horizontal original (`capa.arquivo` do seed). O recorte quadrado é só para o grid.
  - No Vídeo, a capa é a composição gerada (seção 13) ou um reel em loop mudo centralizado sobre o próprio frame desfocado.
  - **Selo circular girando** no canto inferior direito, como o "&WALSH & WORK" do Lex: cerca de 9vw (mínimo 88px), texto circular "ISABELLY LIMA ✦ TRABALHOS ✦" (EN "ISABELLY LIMA ✦ WORK ✦") em volta do gato, uma volta a cada 18s, pausa no hover.
- **Resumo** (margem superior de cerca de 4,5vw), em grid de 12 colunas:
  - Título nas colunas 1–4 (display gótica).
  - `resumo` do seed nas colunas 5–12, em `clamp(22px, 2.4vw, 40px)`/1,3.
  - Abaixo, o botão "+ Ficha técnica" (como o "& more information" do Lex), que abre uma lista em mono 13px com cliente, ano, categoria, ferramentas, agência parceira (quando houver) e entregas (tags). A altura abre animada.
- **Blocos:** na ordem do seed (seção 9.2).
- **Próximo case:** bloco de largura total com o rótulo "PRÓXIMO CASE", o título gigante na display (cerca de 7vw) e a capa revelada no hover. O 07 aponta para o 01.
- **Rodapé:** com o CTA compacto.

### 9.2 Tipos de bloco (campo `tipo` no seed)
- **Espaçamento:** 2,4vw entre mídias; cerca de 7vw antes e depois de `frase` e de `secao`.
- **Entrada das mídias:** imagens aparecem com fade e y 24px→0 (0,9s), uma a uma.

| Tipo | Como renderizar |
|---|---|
| `full` | 1 mídia por linha na largura do conteúdo. Com `largura: "media"`, 62% centralizado (peças pequenas ou de baixa resolução). |
| `pair` | 2 mídias lado a lado com gap de 2,4vw e a mesma altura (verticais, ou imagem 4:5 + vídeo 9:16). |
| `strip` | Carrossel do Instagram. Linha de cabeçalho com título em mono 12px caixa-alta à esquerda, contador "01 / 07" e setas ← → à direita. Abaixo, faixa horizontal com `scroll-snap-type: x mandatory`, arrastável com o mouse (pointer events) e com o teclado. Cada slide tem `(100% − 2,4vw) / 2` no desktop (2 visíveis, mantendo a regra de "até duas por linha") e 80% no mobile. Cursor: gato com "arraste". |
| `reel` | 2 vídeos 9:16 lado a lado com altura máxima de 85vh, centralizados. `autoplay muted loop playsinline` quando 50% visíveis (IntersectionObserver), pausa fora da tela. Botão de som (mono "SOM ON/OFF") no canto, poster, `preload="none"`. |
| `frase` | Frase centralizada em 84% da largura, `clamp(22px, 2.4vw, 40px)`/1,3. As palavras sobem de dentro de uma máscara (SplitText por linhas, stagger 0,03s). |
| `secao` | Só nos cases-grupo: fio superior de 1px (`--lavanda` a 20%); nome do cliente na display à esquerda; `contexto` à direita (18px, até 46 caracteres por linha); `tags` em chips mono; depois os blocos da seção. A `nota` (quando existir) vai para `docs/PENDENCIAS.md` e **não** aparece no site. |

### 9.3 Particularidades por case
Todos os detalhes, inclusive a mídia de cada bloco, estão no seed. Resumo:
- **Vanessa Rosa, Isys Karoline, Brucutu:** sequência de pranchas `full` com 2–3 frases. As pranchas da Vanessa têm 1400×800 (veja seção 13).
- **Social Media:** 8 seções de cliente. Os carrosséis viram `strip`; a maioria das seções também tem um par de destaque ou a capa do cliente. Michelle Lasta e Forestry têm um reel pareado com um post.
- **Material Gráfico:** 3 seções (Fale Seguro, AmarElo, capa de livro).
- **Vídeo:** 2 seções com reels em pares.
- **Ilustração:** 4 seções (desenhos, mascote Turma do Paiol, tattoo, estampa).

---

## 10. Sobre e Contato

### 10.1 Sobre (`/sobre`)
É a página com mais da linguagem dos carrosséis. O conteúdo vem do Carrossel 1 (sobre mim) e do site atual.

1. **Abertura:** "Me chamo **Isabelly**, mas pode me chamar de *Isa* ou de *Bella*." com "Isabelly" sublinhado. Ao lado, colagem de 3 polaroides (`isabelly-02`, `03` e `05`) com fita, rotações leves e parallax de mouse discreto, mais o gato.
2. **Notas de papel** (cards com textura e bordas rasgadas), com textos adaptados do carrossel:
   - "Trabalho como designer e ilustradora freelancer desde 2023, aqui de Palmital, no interior de São Paulo."
   - "Antes do design, comecei uma graduação de Enfermagem. Passei um ano tentando me convencer de que aquele era o meu caminho. Não era. Eu queria ajudar as pessoas, mas isso significava deixar a minha criatividade para trás."
   - "Desde então trabalhei principalmente com social media e design de posts. Hoje me especializo em branding e identidade visual."
   - Do site atual: "Sou movida pela curiosidade de entender como as marcas se comunicam e venho construindo uma visão cada vez mais estratégica sobre identidade visual, linguagem e presença de marca. Trabalho bem tanto em equipe quanto de forma autônoma, e gosto de projetos que tenham propósito e história para contar."
3. **Ferramentas:** "adesivos" como os do slide 4 (Photoshop, Illustrator, InDesign, After Effects, Premiere, Notion, IA generativa).
4. **Formação e experiência:** linha do tempo com as datas **pendentes** (seção 20): formação em Design Gráfico, Agência Dolivs, curso de Ambientação e Manipulação de Imagens (Jack Usephot, 2026) e freelancer desde 2023.
5. **Fora do design:** os slides 5 a 9 do Carrossel 1 (receitas, filmes e séries de terror psicológico e fantasia, animações, a playlist "mega aleatória", os gatos Sukito e Luna) em um bloco `strip`. É conteúdo autoral dela, então pode entrar inteiro, com o slide 10 fechando ("Agora você conhece um pouco do meu repertório criativo :)").
6. **Fechamento:** botões "Baixar CV" e "Vamos conversar".

Escreva a versão EN de todos os textos. Os textos do carrossel são adaptados (mais curtos e sem a menção à idade dela, que fica desatualizada).

### 10.2 Contato (`/contato`)
- Título "Vamos criar algo incrível juntos?" na display.
- Formulário Formspree (`action="https://formspree.io/f/mzdjqaeg"`, envio por `fetch`, como o `js/contato.js` atual):
  - Campos: Nome completo*, E-mail*, WhatsApp, Descreva seu projeto*.
  - Validação inline, honeypot, estados de envio, sucesso e erro na própria página.
- Contatos diretos:
  - E-mail com botão de copiar.
  - WhatsApp: `https://wa.me/5518996505565?text=` com a mensagem "Oi, Isabelly! Vi seu portfólio e quero conversar sobre um projeto."
  - Instagram: `https://instagram.com/bella_designbr`.
  - Behance: `https://www.behance.net/isabellylima11`.
  - LinkedIn: `https://linkedin.com/in/isabelly-lima-396660263`.
  - Localização (Palmital, SP) e o relógio local.

---

## 11. Sistema de movimento

- **Bibliotecas:**
  - GSAP com ScrollTrigger e SplitText. Todos os plugins do GSAP são gratuitos desde 2025.
  - Lenis para o scroll suave (lerp ~0,1), integrado ao ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)` e o `gsap.ticker`).
- **Transição entre páginas:** View Transitions do Astro (`<ClientRouter />`).
  - **Cortina:** um painel `--ameixa` com o gato no centro sobe cobrindo a tela (0,45s), a página troca e o painel sai por cima (0,45s).
  - **Do grid para o case:** elemento compartilhado com `transition:name="capa-{slug}"`; a capa quadrada se transforma na capa 16:9 do case.
  - Reinicialize os scripts em `astro:page-load` e limpe em `astro:before-swap` (mate os ScrollTriggers e destrua a instância do Lenis).
- **Revelações padrão:**
  - Linhas de texto sobem de dentro de máscara (0,9s, `power3.out`).
  - Imagens abrem com `clip-path: inset(100% 0 0 0)` → `inset(0)` (1s, `power4.inOut`).
  - Stagger de 0,08s.
- **Curvas (tokens):** `--ease-out: cubic-bezier(.22,1,.36,1)`; `--ease-zhenya: cubic-bezier(.25,.46,.45,.94)`.
- **`prefers-reduced-motion`:**
  - Sem intro, sem letra a letra, sem parallax, sem pulso de blur e sem Lenis.
  - Só fades de até 200ms.
  - O cursor vira estático (seção 12).
- **Orçamento:**
  - LCP abaixo de 2,5s (preload da foto do hero, AVIF).
  - CLS abaixo de 0,1 (dimensões explícitas em toda mídia).
  - JS da home abaixo de ~120 KB gzip.
  - 60fps num notebook médio. Anime só `transform`, `opacity`, `filter` e `clip-path`.

---

## 12. Cursor: o gatinho

O cliente pediu o cursor como o gatinho da mascote. O arquivo está em `Identidade Visual do Site/Mascote/` e precisa de recorte: use o seu módulo de geração/edição de imagem.

- **Recorte:**
  - A partir de `Logo Preta.png` (a forma mais limpa) e de `pfp Sem stroke.jpg`, gere a cabeça do gato em fundo transparente, sem mudar a forma.
  - Versões: preta com contorno branco de 2px (principal, visível em qualquer fundo) e lavanda.
  - Exporte em PNG 48px e 96px (@2x) e em SVG vetorizado fielmente.
- **Implementação:**
  - Elemento próprio que segue o mouse com suavização (`gsap.quickTo`, ~0,2s), só em `@media (hover: hover) and (pointer: fine)`.
  - Nesse caso, o cursor nativo fica escondido no site todo, menos em campos de texto, onde volta o nativo.
  - Tamanho base: 36px. O ponto de clique fica no centro da cabeça.
- **Estados:**
  - Padrão: gato de 36px.
  - Links e botões: scale 1,35 e rotação de −8°.
  - Capas do grid: gato de 48px com um rótulo em pílula ao lado ("ver case"; mono 11px, fundo `--eletrico`).
  - Faixas `strip`: rótulo "arraste".
  - Vídeos: rótulo "som".
  - Mouse pressionado: scale 0,85.
  - Rótulos em EN: "view case", "drag", "sound".
- **Touch:** sem cursor customizado.
- **Reduced motion:** `cursor: url(/cursor/gato-48.png) 24 24, auto` estático, sem perseguição.

---

## 13. Imagens com IA (módulo de geração/edição de imagem)

Use o módulo **apenas** para a lista abaixo. Registre cada imagem gerada em `docs/IMAGENS-GERADAS.md`: entrada, prompt resumido, saída e onde é usada.

| # | Tarefa | Regras |
|---|---|---|
| 1 | Gato da mascote: recorte, versões e vetorização (seção 5.5 e 12) | Manter a forma exata. Não redesenhar. |
| 2 | Foto do hero a partir de `isabelly-01-damask-roxo.jpg`: versão retrato (proporção ~0,9, pelo menos 1600px de altura), estendendo o fundo damask se precisar e harmonizando luz e cor com a paleta | Não alterar rosto, traços, corpo nem óculos. |
| 3 | Selfies do Sobre (`02`, `03`, `05`): harmonização leve de cor e luz para o clima roxo da identidade | Natural, sem filtro pesado, sem retoque de pele. A moldura polaroide e a fita são CSS/PNG por cima, não pintadas na foto. |
| 4 | Recortes retrato das capas para o hover do hero e para a tela dividida da home | Só recorte e reenquadramento. |
| 5 | Capa do case Vídeo: composição de 3 frames dos reels (sugestão no seed) | Só composição; os frames não são alterados. |
| 6 | Upscale 2× das pranchas da Vanessa Rosa (1400×800) | Sem inventar detalhe nem mudar texto, cor ou layout. Se o resultado distorcer letras, desista e use `largura: "media"`. |
| 7 | Elementos decorativos no estilo dos carrosséis: papel rasgado, fita adesiva, selo postal, adesivos de gravura (esqueleto, besouro, morcego, rosa, aranha) | PNGs originais. Não copie frames de filmes nem ilustrações de terceiros. |
| 8 | Imagens OG (1200×630) por página, se não forem geradas por código | Composição com a capa e o título. |

**Proibido:**
- Alterar trabalhos de clientes (texto, cor, layout, logo).
- Gerar peças de portfólio falsas.
- Alterar feições da Isabelly.
- Remover marcas d'água ou créditos de imagens licenciadas.

---

## 14. Pipeline de mídia

- **`scripts/prepare-media.mjs` (`npm run media`):**
  - Lê `docs/briefing/projetos.seed.json` e copia cada mídia de `_material/isabelly/` para `src/assets/cases/<slug>/NN-<nome-ascii>.<ext>` (numerada na ordem do seed, sem espaços nem acentos).
  - Limita o lado maior a 2560px com `sharp`.
  - Converte os PNGs pesados (Brucutu 5.png e 6.png têm 16–20 MB).
  - Gera o conteúdo das páginas em `src/content/cases/<slug>.json`, com os caminhos novos e os textos PT/EN, como uma content collection do Astro.
- **Imagens:** `<Picture>` do `astro:assets` com `formats: ['avif','webp']`, larguras `[640, 960, 1280, 1920, 2560]` e `sizes` coerente com cada layout (`full` 100vw menos o gutter, `pair` 50vw, `strip` 50vw, grid 25vw). Carregamento lazy, exceto a capa e a foto do hero.
- **Vídeos** (10 arquivos 1440×2560, 12–52s, 8–48 MB), com `ffmpeg`:
  - MP4 H.264 High (CRF ~26, 1080×1920, `+faststart`, AAC 128k, porque existe o botão de som).
  - WebM (VP9 ou AV1).
  - Poster JPG/AVIF do frame de 1s.
  - Saída em `public/media/<slug>/`.
- **Texturas:** tiles WebP de no máximo 1600px.
- **`_material/` nunca entra no git.**

---

## 15. Conteúdo, idiomas e textos

- **Idiomas:** i18n do Astro com `locales: ['pt','en']`, `defaultLocale: 'pt'` e `prefixDefaultLocale: false`.
  - Strings de interface em `src/i18n/pt.json` e `src/i18n/en.json`; conteúdo dos cases vindo do seed.
  - O seletor mantém a página equivalente (trabalhos ↔ work, sobre ↔ about, contato ↔ contact).
  - `hreflang` alternado e `<html lang>` correto.
- **Inglês:** britânico (os clientes estrangeiros dela são irlandeses), natural, nunca tradução literal. Os EN do site atual estavam truncados em várias descrições longas; os do seed já foram completados.
- **Origem dos textos:** cada case e cada seção têm `origemTexto` no seed.
  - `reaproveitado`: use como está.
  - `rascunho — validar com a Isabelly`: use e liste em `docs/PENDENCIAS.md` para revisão.
- **Alt text:** escreva textos descritivos PT/EN para cada mídia (ex.: "Prancha de tipografia da marca Vanessa Rosa: Polymath e Spalla").
- **Depoimentos:** o site atual tem depoimentos ocultos de propósito. Não inclua.

---

## 16. SEO, analytics e migração de URLs

- **GTM `GTM-PJGH2MT6`:** no `<head>` e o `<noscript>` no `<body>`, em todas as páginas menos `/treino`.
- **Por página:** title e description PT/EN, canonical, OG/Twitter (imagem 1200×630) e JSON-LD (`Person` no site; `CreativeWork` em cada case).
- **Sitemap e robots:** `@astrojs/sitemap` (sem `/treino`) e `robots.txt` atualizado.
- **URLs antigas:**
  - Em `public/_redirects` do Cloudflare Pages, com 301:
    - `/index.html` → `/`
    - `/projetos.html` e `/projetos` → `/trabalhos`
    - `/sobre.html` → `/sobre`
    - `/contato.html` → `/contato`
  - **`/projetos/case?slug=…`:** o `_redirects` não lê query string. Crie uma Pages Function em `functions/projetos/case.js` que lê `slug`, procura nos `slugsAntigos` do seed e responde 301 para `/trabalhos/<slug-novo>`; slug desconhecido vai para `/trabalhos`. Mapeamento:
    - `vanessa-rosa` → `vanessa-rosa`
    - `brucutu-chapeiro` → `brucutu-chapeiro`
    - social media, Nutripet e os antigos `construzan`, `dr-giovani-advocacia`, `villas-burguer` → `social-media`
    - impressos antigos → `material-grafico`
    - `video-*` → `video`
    - `ft-irrigacao` → `/trabalhos`
  - Faça também uma página estática `src/pages/projetos/case.astro` com `noindex` e redirecionamento em JS, como reserva.

---

## 17. Acessibilidade

- Landmarks semânticos, link "pular para o conteúdo" e foco visível (contorno de 2px `--eletrico`, offset 3px).
- Contraste AA. `--violeta` só em texto grande ou decorativo.
- Lettering animado com `aria-hidden` e lista real `sr-only`.
- Faixas `strip` navegáveis por teclado, com setas e foco nos slides.
- Vídeos com controle de som acessível, sem áudio automático.
- Menu mobile com foco preso enquanto aberto e fechamento pelo Esc.
- Tudo legível sem JS: a intro e as animações são só camadas por cima de um HTML completo.

---

## 18. Deploy

- **Workflow:** ajuste `.github/workflows/deploy.yml`.
  - Hoje ele faz `wrangler pages deploy .` no push em `master`.
  - Passa a ter: `actions/setup-node` (LTS) → `npm ci` → `npm run build` → `wrangler pages deploy dist --project-name=isabelly-des-br --branch=<main em master, nome da branch nas outras>`.
  - Gatilho: push em `master` (produção) e em `v2-redesign` (preview).
- **Mídia no build:** a mídia preparada precisa estar versionada (`src/assets/`, `public/media/`), porque o CI não tem o `_material/`.
- **Permissões:** os secrets `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` já existem. Não mexa neles. **Push só com autorização do Floriano.**

---

## 19. Marcos e critérios de aceite

### 19.1 Marcos sugeridos
- **M0 · Setup:** repositório, branch, `.gitignore`, material extraído, Astro rodando, `npm run media` funcionando.
- **M1 · Base:** tokens, fontes, texturas, header e rodapé, Lenis, transições, cursor gatinho.
- **M2 · Home:** intro, hero, lettering, trabalhos selecionados, CTA.
- **M3 · Trabalhos:** grid xadrez, painel, hover blur com caixa, CTA, responsivo.
- **M4 · Case:** template e todos os tipos de bloco; os 7 cases preenchidos pelo seed.
- **M5 · Sobre e Contato:** inclusive o formulário Formspree funcionando.
- **M6 · EN:** todas as rotas e textos em inglês.
- **M7 · SEO e deploy:** metadados, sitemap, redirects, Function, workflow (preview sem push até autorização).
- **M8 · QA:** checklist abaixo e relatório final.

### 19.2 Critérios de aceite
- [ ] A home reproduz a sequência da Zhenya (preto → "Oi!" com duas bolinhas → bolhas cobrindo → hero com nome partido em volta da foto), roda uma vez por sessão e respeita reduced motion.
- [ ] O lettering tem 3 linhas, letras entrando uma a uma da direita, estrela, item com blur, item manuscrito sublinhado e "&&".
- [ ] Os trabalhos selecionados da home usam tela dividida com inicial gigante e bloco na cor da marca.
- [ ] `/trabalhos` tem 2 projetos por linha no desktop, cada um com capa + painel, em xadrez, com divisórias de 1px.
- [ ] O hover desfoca a capa e mostra a caixa de cor forte com nome, descrição de uma linha e tags mono.
- [ ] O case tem capa 16:9 com selo girando, resumo grande em 2 colunas, mídias grandes uma por linha, verticais em pares, frases entre as mídias, ficha técnica e próximo case.
- [ ] As marcas são cases separados. Social Media, Material Gráfico, Vídeo e Ilustração têm um case cada, com seções por cliente.
- [ ] Nenhum projeto fora do zip aparece no site.
- [ ] O cursor gatinho funciona com os estados, some no touch e fica estático em reduced motion.
- [ ] PT e EN completos, seletor mantendo a página.
- [ ] Formulário envia pelo Formspree. E-mail copiável. WhatsApp com mensagem pronta.
- [ ] GTM presente. Sitemap e robots corretos. URLs antigas redirecionam com 301.
- [ ] Lighthouse mobile e desktop com 90 ou mais em Performance, Acessibilidade, Boas práticas e SEO. LCP abaixo de 2,5s. CLS abaixo de 0,1.
- [ ] Testado em Chrome, Safari e Firefox (desktop) e em iOS Safari e Android Chrome, nas larguras 375, 768, 1024, 1440 e 1920.
- [ ] `docs/PENDENCIAS.md` e `docs/IMAGENS-GERADAS.md` atualizados.

---

## 20. Pendências (dependem da Isabelly)

Implemente com o que existe e liste cada item em `docs/PENDENCIAS.md`:

1. **Pasta "Terezan Telhas":** em `Social Media/` ela contém os carrosséis da **Thaysa Paixão / Cassulinha Cabelos**, e a subpasta "Post Único" está vazia. O seed já trata o conteúdo como Thaysa / Cassulinha. Confirmar e, se houver material da Terezan Telhas, incluir como seção própria.
2. **Datas divergentes:**
   - O carrossel "sobre mim" diz formação em Design Gráfico de 2024 a 2026.
   - O site atual diz Unicid 2022–2025 (`index.html`) e lista também Publicidade e Propaganda, UNIP, 2021–presente (`sobre.html`).
   - A Agência Dolivs aparece como 2024–2025 (`sobre.html`) e como 2025–presente (`index.html`).
3. **Fontes:** nome e arquivos da gótica, da geométrica e da manuscrita usadas nos carrosséis.
4. **Licença das texturas Freepik** (crédito obrigatório no plano gratuito).
5. **Ano e ferramentas** de Isys Karoline, Vídeo e Ilustração. Cliente direto ou agência no caso da Zen Pensions.
6. **Nome do gatinho:** no carrossel, o gato preto dela se chama Sukito. Se for ele, o nome pode aparecer em microtextos.
7. **Currículo em PDF:** conferir se está atualizado.
8. **Vanessa Rosa:** pedir as pranchas originais em resolução maior que 1400×800.
9. **Revisão:** todos os textos marcados como `rascunho` no seed.

---

## 21. Apêndice: referências

Use as referências como especificação de comportamento e de ritmo. **Não copie código, imagens, fontes nem textos delas**: recrie o efeito com a identidade da Isabelly.

### 21.1 zhenyary.com (Zhenya Rynzhuk)
- **O cliente gostou de:** a home, a animação de entrada, como os projetos estão distribuídos e o lettering com o que a designer faz.
- **Capturas:**
  - `zhenya-entrada-a.jpg` a `g`: preto, "Hey!" com bolinhas vermelha e rosa, bolhas bege cobrindo, hero.
  - `zhenya-hero-mouse-centro.jpg`: hover troca a foto.
  - `zhenya-scroll-1.jpg`: lettering.
  - `zhenya-scroll-2` a `4`: trabalhos em tela dividida.
  - `zhenya-scroll-5.jpg`: "All cases here".
  - `zhenya-scroll-6.jpg`: CTA final.
- **Medições:**
  - Fontes da referência: Schnyder (serifa) e GT Walsheim. Não use; os papéis equivalentes estão na seção 5.3.
  - Lettering em 3 linhas de cerca de 3,4vw, letras com `opacity 0 / translateX(50px)` no início, item `.italic.blur` com camada duplicada desfocada, item `.underline.italic` e `&&` em dois spans.
  - Hero com camadas de linhas (scaleX/scaleY), números 01–09, círculos SVG (scale 0,4→1) e nome com transições de 1s em `cubic-bezier(.25,.46,.45,.94)`.
  - A página Work da referência é uma lista numerada (01–17) com miniaturas verticais. Não é usada aqui: a listagem segue o Herrström.

### 21.2 studioherrstrom.com/work
- **O cliente gostou de:** como os blocos estão separados, a capa de cada projeto e o grid com dois projetos por linha a cada rolagem, no desktop.
- **Capturas:** `herrstrom-work-topo.jpg`, `herrstrom-work-destaque.jpg`, `herrstrom-work-grid-2-por-linha.jpg` e `-b.jpg`. Os banners de cookies aparecem nas capturas; ignore.
- **Medições a 1440px:**
  - Grid de 4 colunas de 360px, sem gap, com divisórias finas.
  - Na parte de baixo, cada projeto ocupa 720×360 (capa de 360 + painel de 360), 2 por linha, alternando os lados.
  - No topo há destaques de 720×720 (capa + painel); não use, porque o pedido foi o grid de 2 por linha.
  - Painel preto com categoria pequena, ícone do cliente, descrição e seta com efeito de flip em `rotate3d`.

### 21.3 andwalsh.com/work/all/lex (&Walsh, case Lex)
- **O cliente gostou de:** a página interna de projeto: capa, resumo curto em letra grande, imagens uma por linha bem grandes (fixas ou animadas), verticais em pares, frases curtas entre as imagens.
- **Capturas:** `andwalsh-lex-01-capa.jpg` a `17`, mais os 3 prints do cliente em `prints-do-cliente/`.
- **Medições a 1440px:**
  - Margem de cerca de 37px; capa de 1352×761.
  - H1 de 46px numa coluna de 416px; resumo de 34px numa coluna de 905px.
  - Frases centralizadas de 34px em 1205px.
  - Header com logo à esquerda e Work / Info / Contact grandes à direita, sobre a capa com degradê; selo circular girando no canto da capa.

### 21.4 nvmbr.in (November)
- **O cliente gostou de:** o efeito de blur no hover junto com a caixa que abre com a descrição do projeto, em cor contrastante bem forte.
- **Capturas e prints:** `november-grid-normal.jpg`, `november-hover-goglocal.jpg`, `prints-do-cliente/november-1-normal.webp` e `november-2-hover.webp`.
- **Medições:**
  - Grid de 3 colunas com cards de 446px e gap de 14px.
  - Caixa `.gab-overlay` absoluta em `top: 0; left: 0`, margem 12px, cerca de 80% da largura, padding `14px 15px 15px`, fundo `#FFFF00`, opacidade 0→1 em 0,5s.
  - h2 de 14px em 700; p de 14px; tags em mono de 10px, altura 20px, borda de 1px, fundo `rgba(0,0,0,.15)`, raio 3px, gap 7px.
  - Imagem com transição de 0,5s e blur forte.
  - A cor da v2 é `--eletrico`, não o amarelo.

### 21.5 Contexto extra
`curadoria/index.html` (raiz da pasta) é uma curadoria de 15 portfólios feita antes da escolha das 4 referências. Serve só como contexto de padrão de acabamento; em caso de conflito, as 4 referências acima valem.
