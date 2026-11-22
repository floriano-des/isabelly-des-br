# AGENTS.md — isabelly.des.br v2

Instruções para o agente (Codex / ChatGPT 6.2 Astra). Coloque este arquivo na raiz do repositório.

## O projeto
Redesign do portfólio da designer gráfica e ilustradora Isabelly Lima, em Astro, com animações de nível premiado e a identidade gótica roxa dela. A especificação completa está em `docs/briefing/BRIEFING.md`. Leia o briefing inteiro antes de escrever código.

## Ordem de leitura
1. `docs/briefing/BRIEFING.md`
2. `docs/briefing/projetos.seed.json` (conteúdo: cases, mídias, textos PT/EN, layout de cada bloco)
3. `docs/briefing/referencias/` (capturas das 4 referências e prints do cliente)
4. `_material/` (material da Isabelly, fora do git; a seção 4.2 do briefing explica como montar)

## Regras
- Trabalhe na branch `v2-redesign`. Commits por marco são permitidos. **Não faça push, merge em `master` nem deploy de produção sem autorização explícita do Floriano.**
- `_material/` nunca vai para o git. Mídia preparada vai para `src/assets/` e `public/media/` pelo script `npm run media`.
- Conteúdo só do zip. Projeto que não está no seed não entra no site.
- Tarefas de imagem (recorte do gatinho, fotos da Isabelly, upscale, composições, elementos decorativos) usam o seu **módulo de geração/edição de imagem**, só dentro da lista da seção 13 do briefing. Registre cada uma em `docs/IMAGENS-GERADAS.md`.
- Nunca altere trabalhos de clientes, feições da Isabelly, marcas d'água ou créditos de imagens licenciadas.
- Textos marcados como `rascunho` no seed entram no site e também vão para `docs/PENDENCIAS.md`. Notas internas (`nota`, `notas`) nunca aparecem no site.
- Não copie código, imagens, fontes nem textos das referências: recrie o comportamento.
- Respeite `prefers-reduced-motion` e mantenha o HTML completo sem JS.
- Comunicação, commits e documentação em português do Brasil.

## Comandos (depois do setup)
- `npm run dev`: servidor local
- `npm run media`: prepara imagens e vídeos a partir do seed e do `_material/`
- `npm run build` e `npm run preview`: build estático em `dist/`

## Pronto quando
Os critérios da seção 19.2 do briefing estão todos atendidos, `docs/PENDENCIAS.md` e `docs/IMAGENS-GERADAS.md` estão atualizados, e o relatório final lista o que foi feito, o que ficou pendente e como testar.
