import { parse, __get__ as get, __set__ as set } from '../src/parser';
import { dataFactory } from '../src/data-factory';
import { charCode, fillWithString } from './utils';

const readHead = get('readHead');
const readBasicChunkData = get('readBasicChunkData');
const readChunk = get('readChunk');
const readBody = get('readBody');

set('PARSERS', {
  PACK: jest.fn(() => 'TEST'),
  SIZE: jest.fn(() => 'TEST'),
  XYZI: jest.fn(() => 'TEST'),
  RGBA: jest.fn(() => 'TEST'),
  MATT: jest.fn(() => 'TEST'),
});

function fillWithChunks(view, baseOffset, chunks) {
  chunks.forEach(({ id, numContent, numChildren }, i) => {
    const offset = baseOffset + i * 12;
    fillWithString(view, offset, id);
    view.setUint32(offset + 4, numContent, true);
    view.setUint32(offset + 8, numChildren, true);
  });
}

describe('readHead()', () => {
  it('should correctly parse file head', () => {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);

    fillWithString(view, 0, 'VOX ');
    view.setUint32(4, 150, true);

    const data = dataFactory(view.buffer);

    expect(readHead(data)).toEqual({
      id: 'VOX ',
      version: 150,
    });
  });
});

describe('readBasicChunkData()', () => {
  it('should correctly parse basic chunk', () => {
    const chunks = [{ id: 'MATT', numContent: 12, numChildren: 1024 }];
    const buffer = new ArrayBuffer(12);
    const view = new DataView(buffer);
    fillWithChunks(view, 0, chunks);
    const data = dataFactory(view.buffer);
    expect(readBasicChunkData(data)).toEqual(chunks[0]);
  });
});

describe('readChunk()', () => {
  it('should correctly parse chunk data', () => {
    const chunks = [{ id: 'MATT', numContent: 12, numChildren: 1024 }];
    const buffer = new ArrayBuffer(12);
    const view = new DataView(buffer);
    fillWithChunks(view, 0, chunks);
    const data = dataFactory(view.buffer);
    expect(readChunk(data)).toEqual(
      Object.assign(chunks[0], { content: 'TEST' })
    );
  });

  it('should throw if chunk id is not recognized', () => {
    const chunks = [{ id: 'TEST', numContent: 12, numChildren: 1024 }];
    const buffer = new ArrayBuffer(12);
    const view = new DataView(buffer);
    fillWithChunks(view, 0, chunks);
    const data = dataFactory(view.buffer);
    expect(() => readChunk(data)).toThrow();
  });
});

describe('readBody()', () => {
  it('should correctly parse multiple chunks', () => {
    const chunks = [
      { id: 'MATT', numContent: 12, numChildren: 24 },
      { id: 'XYZI', numContent: 12, numChildren: 24 },
    ];
    const buffer = new ArrayBuffer(24);
    const view = new DataView(buffer);
    fillWithChunks(view, 0, chunks);
    const data = dataFactory(view.buffer);
    expect(readBody(data)).toEqual(
      chunks.map(chunk => Object.assign(chunk, { content: 'TEST' }))
    );
  });
});

describe('parse()', () => {
  it('should correctly parse whole buffer', () => {
    const buffer = new ArrayBuffer(8 /* head */ + 36 /* chunks */);
    const view = new DataView(buffer);

    // head
    fillWithString(view, 0, 'VOX ');
    view.setUint32(4, 150, true);

    // chunks
    const chunks = [
      { id: 'MAIN', numContent: 12, numChildren: 24 },
      { id: 'MATT', numContent: 12, numChildren: 24 },
      { id: 'XYZI', numContent: 12, numChildren: 24 },
    ];
    fillWithChunks(view, 8, chunks);

    expect(parse(view.buffer)).toEqual({
      id: 'VOX ',
      version: 150,
      body: {
        id: 'MAIN',
        numContent: 12,
        numChildren: 24,
        children: chunks
          .slice(1)
          .map(chunk => Object.assign(chunk, { content: 'TEST' })),
      },
    });
  });

  it('should throw if file id is incorrect', () => {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    fillWithString(view, 0, 'VOX!');
    view.setUint32(4, 150, true);
    expect(() => parse(view.buffer)).toThrow();
  });

  it('should throw if main chunk id is incorrect', () => {
    const buffer = new ArrayBuffer(20);
    const view = new DataView(buffer);

    fillWithString(view, 0, 'VOX ');
    view.setUint32(4, 150, true);

    const chunks = [{ id: 'XYZI', numContent: 12, numChildren: 24 }];
    fillWithChunks(view, 8, chunks);

    expect(() => parse(view.buffer)).toThrow();
  });
});
