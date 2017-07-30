# vox-parser

[![Build Status][build-badge]][build-url]
[![Code Coverage][coverage-badge]][coverage-url]
[![Gzip Size][size-badge]][size-url]

`vox-parser` is a tiny library (currently UMD bundle weights `967 B` gzipped) for parsing voxel models saved in vox format used by [MagicalVoxel][magical-voxel]. Example models and specification of `vox` file format can be found [here][vox-format-repo].

## Installation

To use library install it with `npm`:

```js
npm install vox-parser
```

And then in `node.js` environment:

```js
const { parse } = require('vox-parser');
```

Or using ES2015 modules:

```js
import { parse } from 'vox-parser';
```

Enviroment that you are using needs to support [`ArrayBuffer`][array-buffer-mdn] and [`DataView`][data-view-mdn] built-in objects (or corresponding polyfills).

## Use

```js
const result = parse(buffer);
console.log(result);
```

where `buffer` is an `ArrayBuffer` instance. 

To understand the structure of `result` it is higly recommended to check the official [specification][vox-format-repo].

Output consists of basic information about file:

```js
{
  id: 'VOX ', // file id (if different than 'VOX ' throws error)
  version: 150, // file version
  body: { ... }, // file contents
}
```

`body` contains information about all the chunks contained in the file. Basic chunk structure looks like this:

```js
{
  id: 'MAIN', // name of chunk
  numContent: 0, // length of chunk content in bytes
  numChildren: 25458, // length of chunk children in bytes
  content?: { ... }, // content of chunk if numContent > 0
  children?: [ ... ], // chunk children if numChildren > 0
}
```

Meaning of different chunks is described in [specification][vox-format-repo]. Below you can check structure of different chunks.

### `PACK`

```js
{
  numModels: 4,
}
```

### `SIZE`

```js
{
  x: 31,
  y: 7,
  z: 24,
}
```

### `XYZI`

```js
{
  numVoxels: 808,
  voxels: [
    { x: 19, y: 5, z: 6, i: 100 },
    ...,
  ],
}
```

### `RGBA`

```js
{
  palette: [
    { r: 255, g: 255, b: 255, a: 255 },
    ...,
  ],
}
```

### `MATT`

```js
{
  id: 1,
  materialType: 'diffuse' | 'metal' | 'glass' | 'emissive',
  materialWeight: 0.43,
  properties: [
    { property: 'plastic', value: 0.1 },
    { property: 'roughness', value: 0.1 },
    { property: 'specular', value: 0.1 },
    { property: 'ior', value: 0.1 },
    { property: 'attenuation', value: 0.1 },
    { property: 'power', value: 0.1 },
    { property: 'glow', value: 0.1 },
    { property: 'isTotalPower', value: null },
  ],
}
```

Default palette is **not** included in the librabry.

## Examples

### Node.js

In `node.js` environment the easiest way to play with voxel models is to simply read them. The basic example would be:

```js
const fs = require('fs');
const { parse } = require('vox-parser');

fs.readFile('example.vox', (err, buf) => {
  if (err) throw new Error(err);
  const result = parse(buf.buffer);
  console.log(result);
})
```

If you won't specify format to `readFile` it will result in binary buffer, in `node.js` `4.x` and higher instances of `Buffer` are also instances of `Uint8Array` so you can access `ArrayBuffer` by `buffer` property to supply it to `parse` function.

### Browser

In browser you will probably need to fetch file located on the server. Basic example using `fetch` would be:

```js
import { parse } from 'vox-parser';

fetch('/static/example.vox')
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => {
    const result = parse(arrayBuffer);
    console.log(result);
  });
```

`fetch` provides an API to parse response to `ArrayBuffer`, so the only thing left to do is to pass parsed response to `parse` function.

[magical-voxel]: http://ephtracy.github.io
[vox-format-repo]: https://github.com/ephtracy/voxel-model
[array-buffer-mdn]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
[data-view-mdn]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
[build-badge]: https://img.shields.io/circleci/project/github/straku/vox-parser.svg?style=flat-square
[build-url]: https://circleci.com/gh/straku/vox-parser
[coverage-badge]: https://img.shields.io/codecov/c/github/straku/vox-parser.svg?style=flat-square
[coverage-url]: https://codecov.io/gh/straku/vox-parser
[size-badge]: http://img.badgesize.io/https://unpkg.com/vox-parser/lib/vox-parser.umd.min.js?compression=gzip&label=gzip%20size&style=flat-square
[size-url]: https://unpkg.com/vox-parser/lib/vox-parser.umd.min.js
 