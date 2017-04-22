const dataFactory = buffer => {
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
    nextPattern(pattern, bytes = 4) {
      let method;
      switch (bytes) {
        case 1:
          method = 'getUint8';
          break;
        default:
        case 4:
          method = 'getUint32';
          break;
      }
      return pattern.reduce((obj, key) => {
        obj[key] = data[method](offset, true);
        offset += bytes;
        return obj;
      }, {});
    },
  };
};

exports.dataFactory = dataFactory;
