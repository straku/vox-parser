import { inspect } from 'util';

export function charCode(char) {
  return char.charCodeAt(0);
}

export function fillWithString(view, offset, string) {
  string.split('').forEach((letter, i) => {
    view.setUint8(offset + i, charCode(letter));
  });
}

export function log(data) {
  console.log(
    inspect(data, {
      depth: null,
      maxArrayLength: null,
    })
  );
}
