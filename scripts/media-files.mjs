import { stat, mkdir, rename, rm, readFile, utimes } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';

const exec = promisify(execFile);

// No Windows, a prévia ou o antivírus pode manter o destino aberto durante a troca.
export async function publishFile(temporary, output) {
  for (let attempt = 0; ; attempt++) {
    try {
      await rename(temporary, output);
      return;
    } catch (error) {
      if (!['EBUSY', 'EPERM', 'EACCES', 'UNKNOWN'].includes(error.code)) throw error;
      const [next, existing] = await Promise.all([readFile(temporary), readFile(output).catch(() => undefined)]);
      if (existing?.equals(next)) {
        const now = new Date();
        await utimes(output, now, now).catch(() => {});
        return;
      }
      if (attempt >= 8) throw error;
      await delay(125 * (attempt + 1));
    }
  }
}

// Publica apenas arquivos completos; uma conversão interrompida pode ser repetida.
export async function prepareFile(input, output, writer, recipeTime = 0) {
  const previous = await stat(output).catch(() => undefined);
  const sourceTime = (await stat(input)).mtimeMs;
  if (!process.argv.includes('--force') && previous?.size && previous.mtimeMs >= Math.max(sourceTime, recipeTime)) return;
  await mkdir(dirname(output), { recursive: true });
  const temporary = join(dirname(output), `.${randomUUID()}-${basename(output)}`);
  try {
    await writer(temporary);
    await publishFile(temporary, output);
  } finally {
    await rm(temporary, { force: true });
  }
}

export async function probeVideo(input) {
  const { stdout } = await exec('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', input]);
  const { width, height } = JSON.parse(stdout).streams[0];
  const scale = Math.min(1, 1080 / width, 1920 / height);
  return { width: 2 * Math.floor(width * scale / 2), height: 2 * Math.floor(height * scale / 2) };
}

export async function extractCoverFrame(input, output, seconds, recipeTime) {
  await prepareFile(input, output, (file) => exec('ffmpeg', [
    '-nostdin', '-v', 'error', '-ss', String(seconds), '-i', input, '-map', '0:v:0',
    '-frames:v', '1', '-threads', '2', file
  ]), recipeTime);
}

export async function prepareVideo(input, publicDirectory, media) {
  const run = (url, args) => prepareFile(input, join(publicDirectory, url), async (file) => {
    await exec('ffmpeg', ['-nostdin', '-v', 'error', '-threads', '2', ...args, file]);
  });
  await run(media.poster, ['-ss', '1', '-i', input, '-frames:v', '1', '-vf', 'scale=640:-2', '-q:v', '3', '-threads', '2']);
  const video = ['-i', input, '-map', '0:v:0', '-map', '0:a:0?', '-map_metadata', '-1', '-vf', `scale=${media.width}:${media.height},setsar=1`, '-pix_fmt', 'yuv420p'];
  await run(media.src, [...video, '-c:v', 'libx264', '-profile:v', 'high', '-crf', '26', '-preset', 'veryfast', '-threads', '3', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart']);
  await run(media.webm, [...video, '-c:v', 'libvpx-vp9', '-deadline', 'realtime', '-cpu-used', '7', '-row-mt', '1', '-threads', '4', '-b:v', '0', '-crf', '36', '-c:a', 'libopus', '-b:a', '96k']);
}
