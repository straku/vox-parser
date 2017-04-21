const fs = require('fs');

const log = require('./logger');
const { parseNumber, parseString } = require('./value-parsers');
const { PARSERS } = require('./chunk-parsers');

const readHead = array => ({
  id: parseString(array, 0, 4),
  version: parseNumber(array, 4, 8),
  offset: 8,
});

const readBasicChunkData = (array, offset) => ({
  id: parseString(array, offset, offset + 4),
  numContent: parseNumber(array, offset + 4, offset + 8),
  numChildren: parseNumber(array, offset + 8, offset + 12),
  offset: offset + 12,
});

const readChunk = (array, offset) => {
  const chunk = readBasicChunkData(array, offset);
  // log(chunk);
  return PARSERS[chunk.id](array, chunk.offset);
};

const readBody = (array, offset) => {
  let body = [];
  while (offset < array.length) {
    const chunk = readChunk(array, offset);
    // log(chunk);
    body.push(chunk.data);
    offset = chunk.offset;
  }
  return body;
};

const parse = array => {
  const head = readHead(array);
  if (head.id !== 'VOX ') {
    throw new Error(
      `Invalid file format: expected id 'VOX ', found: '${head.id}'`
    );
  }
  if (head.version !== 150) {
    throw new Error(
      `Invalid file format: expected version 150, found: ${head.version}`
    );
  }

  const mainChunk = readBasicChunkData(array, head.offset);
  if (mainChunk.id !== 'MAIN') {
    throw new Error(
      `Invalid file format: expected first chunk to have id 'MAIN, found: ${id}`
    );
  }

  const body = readBody(array, mainChunk.offset);

  return body;
};

fs.readFile('./resources/horse.vox', (err, buffer) => {
  if (err) throw new Error(err);
  const array = new Uint8Array(buffer);
  const parsed = parse(array);
  log(parsed);
});
