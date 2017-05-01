export const dataFactory = buffer => {
  const data = new DataView(buffer);
  let offset = 0;

  return {
    hasNext() {
      return offset < data.byteLength;
    },
    nextString() {
      let str = '';
      for (let i = 0; i < 4; i++) {
        str += String.fromCharCode(data.getUint8(offset, true));
        offset += 1;
      }
      return str;
    },
    nextInt() {
      const int = data.getUint32(offset, true);
      offset += 4;
      return int;
    },
    nextFloat() {
      const float = data.getFloat32(offset, true);
      offset += 4;
      return float;
    },
    nextPattern(pattern, bytes) {
      return pattern.reduce((obj, key) => {
        obj[key] = data[`getUint${bytes * 8}`](offset, true);
        offset += bytes;
        return obj;
      }, {});
    },
  };
};
