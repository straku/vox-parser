const {
  parseNumber,
  parseString,
  parseNumberFloat,
} = require('./value-parsers');

const parsePattern = (
  array,
  offset,
  pattern,
  bytes = 4,
  skipOffset = false
) => {
  let chunk = {};
  pattern.forEach(coord => {
    const end = offset + bytes;
    chunk[coord] = parseNumber(array, offset, end);
    offset = end;
  });
  const result = { data: chunk };
  return skipOffset ? result : Object.assign(result, { offset });
};

const parsePackChunk = (array, offset) => ({
  data: {
    numModels: parseNumber(array, offset, offset + 4),
  },
  offset: offset + 4,
});

const parseSizeChunk = (array, offset) =>
  parsePattern(array, offset, ['x', 'y', 'z']);

const parseXYZIChunk = (array, offset) => {
  const numVoxels = parseNumber(array, offset, offset + 4);
  offset = offset + 4;
  let voxels = [];
  for (let i = 0; i < numVoxels; i++) {
    const voxel = parsePattern(array, offset, ['x', 'y', 'z', 'i'], 1);
    voxels.push(voxel.data);
    offset = voxel.offset;
  }
  return { data: voxels, offset };
};

const parseRGBAChunk = (array, offset) => {
  let chunk = [];
  for (let i = 0; i < 256; i++) {
    const newOffset = offset + i * 4;
    chunk.push(parsePattern(array, newOffset, ['r', 'g', 'b', 'a'], 1, true));
  }
  return { data: chunk, offset: offset + 1024 };
};

const MATERIAL_TYPE = {
  0: 'diffuse',
  1: 'metal',
  2: 'glass',
  3: 'emissive',
};

const PROPERTIES = [
  'plastic',
  'roughness',
  'specular',
  'ior',
  'attenuation',
  'power',
  'glow',
  'isTotalPower',
];

const parseMattChunk = (array, offset) => {
  const id = parseNumber(array, offset, offset + 4);
  const materialType = parseNumber(array, offset + 4, offset + 8);
  const materialWeight = parseNumberFloat(array, offset + 8, offset + 12);
  const propertyBits = parseNumber(array, offset + 12, offset + 16);
  const propertyFlags = [
    propertyBits & 1,
    propertyBits & 2,
    propertyBits & 4,
    propertyBits & 8,
    propertyBits & 16,
    propertyBits & 32,
    propertyBits & 64,
    propertyBits & 128,
  ];
  offset += 16;
  const properties = propertyFlags
    .map((flag, i) => ({ property: PROPERTIES[i], flag }))
    .filter(({ flag }) => flag)
    .map(({ property }, i) => {
      if (property !== 'isTotalPower') {
        const value = parseNumberFloat(array, offset, offset + 4);
        offset += 4;
        return { property, value };
      } else {
        return { property };
      }
    });

  return {
    data: {
      id,
      materialType: MATERIAL_TYPE[materialType],
      materialWeight,
      properties,
    },
    offset,
  };
};

const PARSERS = {
  PACK: parsePackChunk,
  SIZE: parseSizeChunk,
  XYZI: parseXYZIChunk,
  RGBA: parseRGBAChunk,
  MATT: parseMattChunk,
};

exports.PARSERS = PARSERS;
