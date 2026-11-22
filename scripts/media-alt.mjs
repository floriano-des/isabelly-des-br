import { readFileSync } from 'node:fs';

const catalogue = JSON.parse(readFileSync(new URL('./media-alt.json', import.meta.url), 'utf8'));
export function altFor(file) {
  const text = catalogue[file];
  if (!text) throw new Error(`Falta descrição PT/EN de ${file}`);
  return { pt: text[0], en: text[1] };
}

export const photoDescriptions = [
  { pt: 'Isabelly Lima de óculos, com cabelo preto e batom escuro, diante de um damasco roxo.', en: 'Isabelly Lima wearing glasses and dark lipstick against a purple damask background.' },
  { pt: 'Isabelly de camiseta branca diante de uma parede escura estampada.', en: 'Isabelly in a white T-shirt against a dark patterned wall.' },
  { pt: 'Isabelly dentro de um carro, com luz natural no rosto.', en: 'Isabelly sitting in a car with daylight on her face.' },
  { pt: 'Retrato frontal de Isabelly com óculos e roupa escura.', en: 'Front-facing portrait of Isabelly wearing glasses and dark clothing.' },
  { pt: 'Isabelly olha para baixo, com os cabelos pretos sobre os ombros.', en: 'Isabelly looking down, with black hair falling over her shoulders.' },
  { pt: 'Isabelly olha para a câmera no banco do carro.', en: 'Isabelly looking at the camera from a car seat.' }
];
