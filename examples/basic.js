import fs from 'fs';
import path from 'path';

import { parse } from '../src/index';
import { log } from '../src/logger';

fs.readFile(path.join(__dirname, 'horse.vox'), (err, rawBuffer) => {
  if (err) throw new Error(err);
  const parsed = parse(rawBuffer.buffer);
  log(parsed);
});
