const { readFileSync } = require('fs');
const { execSync } = require('child_process');
const glob = require('glob');
const gzipSize = require('gzip-size');
const padLeft = require('lodash.padleft');
const padRight = require('lodash.padright');

const formatSize = size =>
  (Math.abs(size) < 1024 ? `${size} B` : `${(size / 1024).toFixed(2)} kB`);

const readFiles = () =>
  glob.sync('lib/*.js').map(file => {
    const buffer = readFileSync(file);
    return {
      name: file.split('/')[1],
      size: gzipSize.sync(buffer),
    };
  });

// check file sizes before build
const filesBefore = readFiles();

// clean and build project
execSync('npm run build');

// check file sizes after build
const filesAfter = readFiles();

const result = filesAfter.reduce((result, file) => {
  const match = filesBefore.find(({ name }) => name === file.name);
  if (match !== undefined) {
    result.push({
      name: file.name,
      sizeBefore: formatSize(match.size),
      sizeAfter: formatSize(file.size),
      diff: formatSize(file.size - match.size),
    });
  }
  return result;
}, []);

const columnLengths = [
  Math.max(...result.map(file => file.name.length)),
  Math.max(...result.map(file => file.sizeBefore.length)),
  Math.max(...result.map(file => file.sizeAfter.length)),
  Math.max(...result.map(file => file.diff.length)),
];

result.forEach(file => {
  console.log(
    padRight(file.name, columnLengths[0] + 2),
    '|',
    padLeft(file.sizeBefore, columnLengths[1] + 2),
    '|',
    padLeft(file.sizeAfter, columnLengths[2] + 2),
    '|',
    padLeft(file.diff, columnLengths[3] + 2)
  );
});
