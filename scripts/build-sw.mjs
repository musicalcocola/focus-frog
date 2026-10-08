import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, relative } from 'node:path';

const root = resolve('dist');
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(path));
    else if (entry.name !== 'sw.js') result.push(path);
  }
  return result;
}
const files = (await walk(root)).sort();
const hash = createHash('sha256');
for (const file of files) hash.update(relative(root, file)).update(await readFile(file));
const template = await readFile('src/sw-template.js', 'utf8');
hash.update(template);
const version = hash.digest('hex').slice(0, 16);
const shell = files.map(file => relative(root, file).replaceAll('\\', '/'));
await writeFile(resolve(root, 'sw.js'), `const VERSION = ${JSON.stringify(version)};\nconst SHELL = ${JSON.stringify(shell)};\n${template}`);
console.log(`Offline shell ${version}: ${shell.length} files`);
