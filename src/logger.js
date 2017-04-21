const { inspect } = require('util');

module.exports = function(data) {
  console.log(
    inspect(data, {
      depth: null,
      maxArrayLength: null,
    })
  );
};
