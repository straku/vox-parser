import fs from 'fs';
import path from 'path';

import glob from 'glob';

import { parse } from '../../src/index';

function shortenChunkArray(chunk, name) {
  return Object.assign(chunk, {
    content: Object.assign(chunk.content, {
      [name]: `Array[${chunk.content[name].length}]`,
    }),
  });
}

function shortenProperties(chunk) {
  return Object.assign(chunk, {
    content: Object.assign(chunk.content, {
      properties: chunk.content.properties.map(
        p => `${p.property}: ${p.value}`
      ),
    }),
  });
}

function formatResult(result) {
  try {
    const formattedChunks = result.body.children.map(chunk => {
      if (chunk.id === 'XYZI') {
        return shortenChunkArray(chunk, 'voxels');
      }

      if (chunk.id === 'RGBA') {
        return shortenChunkArray(chunk, 'palette');
      }

      if (chunk.id === 'MATT') {
        return shortenProperties(chunk);
      }

      return chunk;
    });
    result.body.children = formattedChunks;
    return result;
  } catch (e) {
    return result;
  }
}

test('should correctly parse vox files', () => {
  const files = glob.sync(path.join(__dirname, './files/*.vox'));
  files.forEach(file => {
    const { buffer } = fs.readFileSync(file);
    const result = parse(buffer);
    expect(formatResult(result)).toMatchSnapshot();
  });
});
