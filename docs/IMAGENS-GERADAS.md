# Imagens e derivados da v2

Registro de 22/11/2026. Os arquivos originais da designer estão em `_material/`. As imagens utilizadas pelo build estão em `src/assets/` e `public/`.

| Recurso | Entrada e método | Saída e uso |
| --- | --- | --- |
| Mascote | O ImageGen integrado recebeu `Identidade Visual do Site/Mascote/Logo Preta.png` e o pedido de isolar a cabeça em fundo transparente, conservando a geometria original e acrescentando contorno claro. A geração mudou o desenho e foi descartada. A versão usada foi vetorizada diretamente do PNG fornecido, com Potrace, e comparada com o avatar original. | `public/cursor/gato.svg`, três variantes de cor, PNGs de 48 e 96 px e `public/apple-touch-icon.png`. Cabeçalho, selos, cursor, transição e favicon. |
| Gravura do morcego | ImageGen integrado. Prompt resumido em português: morcego frontal de asas abertas em gravura naturalista oitocentista, hachuras em tinta ameixa, recorte de papel marfim e fundo transparente. | `public/media/gravuras/morcego.png`. Adesivo decorativo na página 404. |
| Fotografias | Seis fotos do acervo e o retrato de infância enviado pela Isabelly, em AVIF e WebP. O original de 1440 × 1440 px fica em `_material/fotos/isabelly-infancia.png`. | A foto de infância abre o Sobre. Outras fotos do acervo aparecem na home, no Contato e nos cartões de compartilhamento. |
| Fora do design | Seis fotos enviadas pela Isabelly, guardadas em `_material/fotos/fora-do-design/`. O preparo conserva as proporções nas variantes AVIF e WebP. | A grade do Sobre enquadra cada foto em um quadrado. A ordem e as legendas estão na lista `hobbies` do inventário. |
| Trabalhos e vídeos | Conversão das peças originais e extração de posters dos dez reels. Reenquadramento responsivo das capas. As pranchas da Vanessa conservam a resolução disponível. | Galerias, capas, hover do hero e trabalhos selecionados. A abertura de Vídeo apresenta três frames nativos de 1440 × 2560 px, lado a lado em HTML e CSS. O grid usa um recorte quadrado do primeiro. |
| Estampa de formandos | Foto do esboço a lápis fornecida pela Isabelly (1200 × 1600 px). A preparação conserva a folha inteira e os traços originais. | Abre a sequência da estampa, antes dos mockups das camisetas. |
| Posts do Instagram no Sobre | A primeira e a terceira capas vêm do slide 1 dos carrosséis 2 e 3 do acervo. A capa de Isys vem da primeira imagem da própria [publicação da Isabelly](https://www.instagram.com/p/Dfua3aTGy4V/). | As três capas inteiras em 4:5, com variantes locais AVIF e WebP e link direto para cada post. |
| Cartões Open Graph e Twitter | Composição em Sharp com títulos e legendas em PT e EN. A home e o contato usam retratos da Isabelly. O Sobre usa a foto de infância, Trabalhos reúne três peças do portfólio e a página 404 usa a gravura do morcego. Cada case usa sua arte de capa ou, no caso de Vídeo, três frames dos reels. | `public/og/pt/` e `public/og/en/` contêm 24 JPEGs de 1200 × 630. O gerador registra o texto alternativo e a versão de cada imagem em `src/data/open-graph.json`. |
| Texturas | Redução e compressão dos quadros completos fornecidos no material da marca. | Quatro tiles WebP em `public/media/texturas/`. A atribuição aparece no rodapé. |

O pipeline de mídia e de cartões sociais está disponível em `npm run media`. As pendências de acervo, licença e revisão estão em [PENDENCIAS.md](PENDENCIAS.md).
