import { PARSERS } from './chunk-parsers';
import { dataFactory } from './data-factory';

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
    throw new Error(`Unrecognized chunk id: '${chunk.id}'`);
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

export const parse = buffer => {
  const data = dataFactory(buffer);

  const head = readHead(data);
  if (head.id !== 'VOX ') {
    throw new Error(`Expected file id 'VOX ', found: '${head.id}'`);
  }

  const mainChunk = readBasicChunkData(data);
  if (mainChunk.id !== 'MAIN') {
    throw new Error(`Expected 'MAIN' chunk, found: '${mainChunk.id}'`);
  }

  return {
    id: head.id,
    version: head.version,
    body: Object.assign(mainChunk, {
      children: readBody(data),
    }),
  };
};
