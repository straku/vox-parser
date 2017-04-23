import { inspect } from 'util';

export const log = data => {
  console.log(
    inspect(data, {
      depth: null,
      maxArrayLength: null,
    })
  );
};
