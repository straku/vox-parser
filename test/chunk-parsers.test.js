import { PARSERS } from '../src/chunk-parsers';
import { dataFactory } from '../src/data-factory';

const {
  PACK: parsePackChunk,
  SIZE: parseSizeChunk,
  XYZI: parseXYZIChunk,
  RGBA: parseRGBAChunk,
  MATT: parseMattChunk,
} = PARSERS;

function fillUint8(view, offset, array) {
  array.forEach((val, i) => view.setUint8(offset + i, val, true));
}

function fillFloat32(view, offset, array) {
  array.forEach((val, i) => view.setFloat32(offset + i * 4, val, true));
}

function generateBufferWithTestPalette() {
  const buffer = new ArrayBuffer(1024);
  const view = new DataView(buffer);
  for (let i = 0; i < 256; i++) {
    fillUint8(view, i * 4, [128, 128, 128, 255]);
  }
  return view.buffer;
}

test('it should parse correctly PACK chunk', () => {
  const array = new Uint32Array([2]);
  const data = dataFactory(array.buffer);
  expect(parsePackChunk(data)).toEqual({ numModels: 2 });
});

test('it should parse correctly SIZE chunk', () => {
  const array = new Uint32Array([10, 10, 10]);
  const data = dataFactory(array.buffer);
  expect(parseSizeChunk(data)).toEqual({ x: 10, y: 10, z: 10 });
});

test('it should parse correctly XYZI chunk', () => {
  const buffer = new ArrayBuffer(12);
  const view = new DataView(buffer);

  // set number of voxels
  view.setUint32(0, 2, true);
  // prettier-ignore
  fillUint8(view, 4, [
    1, 2, 3, 4, // first voxel
    11, 12, 13, 14, // second voxel
  ]);

  const data = dataFactory(view.buffer);

  expect(parseXYZIChunk(data)).toEqual({
    numVoxels: 2,
    // prettier-ignore
    voxels: [
      { x: 1, y: 2, z: 3, i: 4 },
      { x: 11, y: 12, z: 13, i: 14 },
    ],
  });
});

test('it should parse correctly RGBA chunk', () => {
  const data = dataFactory(generateBufferWithTestPalette());
  const { palette } = parseRGBAChunk(data);
  expect(palette.map(c => c.r).filter(r => r !== 128).length).toEqual(0);
  expect(palette.map(c => c.g).filter(g => g !== 128).length).toEqual(0);
  expect(palette.map(c => c.b).filter(b => b !== 128).length).toEqual(0);
  expect(palette.map(c => c.a).filter(a => a !== 255).length).toEqual(0);
});

test('it should parse correctly MATT chunk', () => {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  view.setUint32(0, 42, true); // id
  view.setUint32(4, 0, true); // material type
  view.setFloat32(8, 0.95, true); // material weight
  view.setUint32(12, parseInt('11111111', 2), true); // property bits
  fillFloat32(view, 16, [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]); // property values

  const data = dataFactory(view.buffer);

  const result = parseMattChunk(data);
  const { properties } = result;

  expect(result.id).toEqual(42);
  expect(result.materialType).toEqual('diffuse');
  expect(result.materialWeight).toBeCloseTo(0.95);
  expect(properties.map(p => p.property)).toEqual([
    'plastic',
    'roughness',
    'specular',
    'ior',
    'attenuation',
    'power',
    'glow',
    'isTotalPower',
  ]);
  properties.slice(0, properties.length - 1).map(p => p.value).forEach(v => {
    expect(v).toBeCloseTo(0.5);
  });
  expect(properties[properties.length - 1].value).toEqual(null);
});
