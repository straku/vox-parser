const { readFileSync } = require('fs');
const { execSync } = require('child_process');
const glob = require('glob');
const gzipSize = require('gzip-size');

function padLeft(string, size, char = ' ') {
  const diff = size - string.length;
  if (diff > 0) return char.repeat(diff) + string;
  return string;
}

function padRight(string, size, char = ' ') {
  const diff = size - string.length;
  if (diff > 0) return string + char.repeat(diff);
  return string;
}

function formatSize(size) {
  const ranges = ['B', 'kB', 'MB', 'GB'];
  const rangeIndex = Math.floor(Math.abs(size) / 1024);
  const divider = rangeIndex * 1024 || 1;
  const formattedSize = (size / divider).toFixed(rangeIndex ? 2 : 0);
  return `${formattedSize} ${ranges[rangeIndex]}`;
}

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

const totalLength = columnLengths.reduce((a, b) => a + b, 0) + 16;

let log = '\n ';

log += padRight('file name', columnLengths[0] + 2) + ' |';
log += padLeft('size old', columnLengths[1] + 2) + ' |';
log += padLeft('size new', columnLengths[2] + 2) + ' |';
log += padLeft('diff', columnLengths[3] + 2);

log += '\n';

for (let i = 0; i < totalLength; i++) {
  log += '-';
}

result.forEach(file => {
  log += '\n ';
  log += padRight(file.name, columnLengths[0] + 2) + ' |';
  log += padLeft(file.sizeBefore, columnLengths[1] + 2) + ' |';
  log += padLeft(file.sizeAfter, columnLengths[2] + 2) + ' |';
  log += padLeft(file.diff, columnLengths[3] + 2);
});

log += '\n';

console.log(log);
