import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const text = z.object({ pt: z.string(), en: z.string() });
const tags = z.object({ pt: z.array(z.string()), en: z.array(z.string()) });
const files = z.array(z.string()).min(1);
const media = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('full'), arquivo: z.string(), largura: z.enum(['total', 'media']) }),
  z.object({ tipo: z.literal('pair'), arquivos: files.length(2) }),
  z.object({ tipo: z.literal('reel'), arquivos: files.length(2) }),
  z.object({ tipo: z.literal('strip'), titulo: text, arquivos: files }),
  z.object({ tipo: z.literal('frase'), texto: text })
]);
const section = z.object({
  tipo: z.literal('secao'), cliente: z.string(), contexto: text, tags, blocos: z.array(media)
});

export const collections = {
  cases: defineCollection({
    loader: glob({ pattern: '*.json', base: './src/content/cases' }),
    schema: z.object({
      slug: z.string(), ordem: z.number().int().positive(), tipo: z.enum(['marca', 'grupo']),
      destaqueHome: z.boolean(), slugsAntigos: z.array(z.string()), titulo: text, categoria: text,
      ano: z.union([z.string(), z.number()]), ferramentas: z.array(z.string()), tags,
      linhaHover: text, resumo: text, corMarca: z.string(), hoverBox: z.string().optional(),
      capa: z.object({ arquivo: z.string() }), blocos: z.array(z.union([media, section])),
      marca: z.object({
        cores: z.record(z.string(), z.string()), tipografias: z.array(z.string())
      }).optional()
    })
  })
};
