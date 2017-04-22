const fs = require('fs');
const path = require('path');

const { parse } = require('../src/parser');
const { log } = require('../src/logger');

fs.readFile(path.join(__dirname, 'horse.vox'), (err, rawBuffer) => {
  if (err) throw new Error(err);
  const parsed = parse(rawBuffer.buffer);
  log(parsed);
});
