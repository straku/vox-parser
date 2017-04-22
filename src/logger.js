const { inspect } = require('util');

const log = data => {
  console.log(
    inspect(data, {
      depth: null,
      maxArrayLength: null,
    })
  );
};

exports.log = log;
