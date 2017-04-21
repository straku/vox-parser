const parseString = (array, from, to) => {
  let str = '';
  for (let i = from; i < to; i++) {
    str += String.fromCharCode(array[i]);
  }
  return str;
};

const parseNumber = (data, from, to) => {
  if (to - from === 1) return data.getUint8(from, true);
  return data.getUint32(from, true);
};

const parseFloatNumber = (data, from, to) => {
  if (to - from !== 4) throw new Error('Float needs to have 4 bytes length');
  return data.getFloat32(from, true);
};

const memoizedParser = func => {
  let data = null;
  return (array, ...rest) => {
    if (!data) {
      data = new DataView(array.buffer);
    }
    return func(data, ...rest);
  };
};

exports.parseString = parseString;
exports.parseNumber = memoizedParser(parseNumber);
exports.parseNumberFloat = memoizedParser(parseFloatNumber);
