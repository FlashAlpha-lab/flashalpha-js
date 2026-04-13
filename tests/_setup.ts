// Loads FLASHALPHA_API_KEY from .env.test.local if not already set.
// This avoids needing to pass the key on the command line.
import * as fs from 'fs';
import * as path from 'path';

if (!process.env['FLASHALPHA_API_KEY']) {
  const envFile = path.join(__dirname, '..', '.env.test.local');
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (m && !process.env[m[1] as string]) {
        process.env[m[1] as string] = m[2];
      }
    }
  }
}
