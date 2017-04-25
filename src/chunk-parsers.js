const parsePackChunk = data => ({
  numModels: data.nextInt(),
});

const parseSizeChunk = data => data.nextPattern(['x', 'y', 'z'], 4);

const parseXYZIChunk = data => {
  const numVoxels = data.nextInt();
  let voxels = [];
  for (let i = 0; i < numVoxels; i++) {
    voxels.push(data.nextPattern(['x', 'y', 'z', 'i'], 1));
  }
  return { numVoxels, voxels };
};

const parseRGBAChunk = data => {
  let palette = [];
  for (let i = 0; i < 256; i++) {
    palette.push(data.nextPattern(['r', 'g', 'b', 'a'], 1));
  }
  return { palette };
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

const parseMattChunk = data => {
  const id = data.nextInt();
  const materialType = data.nextInt();
  const materialWeight = data.nextFloat();
  const propertyBits = data.nextInt();
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
  const properties = propertyFlags
    .map((flag, i) => ({ property: PROPERTIES[i], flag }))
    .filter(({ flag }) => flag)
    .map(({ property }, i) => {
      if (property !== 'isTotalPower') {
        const value = data.nextFloat();
        return { property, value };
      } else {
        return { property };
      }
    });

  return {
    id,
    materialType: MATERIAL_TYPE[materialType],
    materialWeight,
    properties,
  };
};

export const PARSERS = {
  PACK: parsePackChunk,
  SIZE: parseSizeChunk,
  XYZI: parseXYZIChunk,
  RGBA: parseRGBAChunk,
  MATT: parseMattChunk,
};
