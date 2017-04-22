const fs = require('fs');

const log = require('./logger');
const { PARSERS } = require('./chunk-parsers');

const { dataFactory } = require('./data-factory');

const readHead = data => ({
  id: data.nextString(),
  version: data.nextInt(),
});

const readBasicChunkData = data => ({
  id: data.nextString(),
  numContent: data.nextInt(),
  numChildren: data.nextInt(),
});

const readChunk = data => {
  const chunk = readBasicChunkData(data);
  const parser = PARSERS[chunk.id];
  if (typeof parser === 'function') {
    return Object.assign(chunk, {
      content: parser(data),
    });
  } else {
    throw new Error(`Corrupted file, cannor read chunk: '${chunk.id}'`);
  }
};

const readBody = data => {
  let body = [];
  while (data.hasNext()) {
    const chunk = readChunk(data);
    body.push(chunk);
  }
  return body;
};

const parse = data => {
  const head = readHead(data);
  if (head.id !== 'VOX ') {
    throw new Error(
      `Invalid file format: expected id 'VOX ', found: '${head.id}'`
    );
  }

  const mainChunk = readBasicChunkData(data);
  if (mainChunk.id !== 'MAIN') {
    throw new Error(
      `Invalid file format: expected first chunk to have id 'MAIN, found: ${id}`
    );
  }

  return {
    id: head.id,
    version: head.version,
    body: Object.assign(mainChunk, {
      children: readBody(data),
    }),
  };
};

fs.readFile('./resources/horse.vox', (err, rawBuffer) => {
  if (err) throw new Error(err);
  const data = dataFactory(rawBuffer);
  const parsed = parse(data);
  log(parsed);
});
