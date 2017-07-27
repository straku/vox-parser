import { dataFactory } from '../src/data-factory';

function charCode(char) {
  return char.charCodeAt(0);
}

test('it should correctly test if there is data left in the buffer', () => {
  const buffer = new ArrayBuffer(10);
  const data = dataFactory(buffer);
  expect(data.hasNext()).toEqual(true);
});

test('it should correctly test if there is no data left in the buffer', () => {
  const buffer = new ArrayBuffer(0);
  const data = dataFactory(buffer);
  expect(data.hasNext()).toEqual(false);
});

test('it should return correct string from buffer', () => {
  const array = new Uint8Array([
    charCode('T'),
    charCode('E'),
    charCode('S'),
    charCode('T'),
  ]);
  const data = dataFactory(array.buffer);
  expect(data.nextString()).toEqual('TEST');
});

test('it should process string consisting of only 4 characters', () => {
  const array = new Uint8Array([
    charCode('T'),
    charCode('E'),
    charCode('S'),
    charCode('T'),
    charCode('I'),
    charCode('N'),
    charCode('G'),
  ]);
  const data = dataFactory(array.buffer);
  expect(data.nextString()).toEqual('TEST');
});

test('it should return correct 32 bit int from buffer', () => {
  const array = new Uint32Array([42]);
  const data = dataFactory(array.buffer);
  expect(data.nextInt()).toEqual(42);
});

test('it should return correct 32 bit float from buffer', () => {
  const array = new Float32Array([42.42]);
  const data = dataFactory(array.buffer);
  expect(data.nextFloat()).toBeCloseTo(42.42);
});

test('it should return correct pattern from 1 byte buffer', () => {
  const pattern = ['r', 'g', 'b', 'a'];
  // using numbers smaller than 2^8
  const array = new Uint8Array([42, 84, 126, 255]);
  const data = dataFactory(array.buffer);
  expect(data.nextPattern(pattern, 1)).toMatchObject({
    r: 42,
    g: 84,
    b: 126,
    a: 255,
  });
});

test('it should return correct pattern from 4 byte buffer', () => {
  const pattern = ['x', 'y', 'z'];
  // using numbers larger than 2^8 and smaller than 2^32
  const array = new Uint32Array([1024, 2048, 4096]);
  const data = dataFactory(array.buffer);
  expect(data.nextPattern(pattern, 4)).toMatchObject({
    x: 1024,
    y: 2048,
    z: 4096,
  });
});

test('it should process whole buffer', () => {
  // setup buffer
  const buffer = new ArrayBuffer(12);
  const view = new DataView(buffer);

  // fill buffer via DataView
  view.setUint8(0, charCode('T'));
  view.setUint8(1, charCode('E'));
  view.setUint8(2, charCode('S'));
  view.setUint8(3, charCode('T'));
  view.setUint32(4, 42, true);
  view.setFloat32(8, 42.42, true);

  // setup dataFactory and read buffer
  const data = dataFactory(view.buffer);
  const statusBefore = data.hasNext();
  const result = [data.nextString(), data.nextInt(), data.nextFloat()];
  const statusAfter = data.hasNext();

  // assert
  expect(statusBefore).toEqual(true);
  expect(result[0]).toEqual('TEST');
  expect(result[1]).toEqual(42);
  expect(result[2]).toBeCloseTo(42.42);
  expect(statusAfter).toEqual(false);
});
