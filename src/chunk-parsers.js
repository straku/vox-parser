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

const MATERIAL_TYPE = ['diffuse', 'metal', 'glass', 'emissive'];

const parseMattChunk = data => {
  const id = data.nextInt();
  const materialType = data.nextInt();
  const materialWeight = data.nextFloat();
  const propertyBits = data.nextInt();
  const propertyFlags = [
    (propertyBits & 1) > 0 && 'plastic',
    (propertyBits & 2) > 0 && 'roughness',
    (propertyBits & 4) > 0 && 'specular',
    (propertyBits & 8) > 0 && 'ior',
    (propertyBits & 16) > 0 && 'attenuation',
    (propertyBits & 32) > 0 && 'power',
    (propertyBits & 64) > 0 && 'glow',
    (propertyBits & 128) > 0 && 'isTotalPower',
  ];
  const properties = propertyFlags.filter(Boolean).map(property => ({
    property,
    value: property !== 'isTotalPower' ? data.nextFloat() : null,
  }));

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
