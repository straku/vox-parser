const { readFileSync } = require('fs');
const { execSync } = require('child_process');

const glob = require('glob');
const gzipSize = require('gzip-size');

const { printTable } = require('./printer');

function formatSize(size) {
  const ranges = ['B', 'kB', 'MB', 'GB'];
  const rangeIndex = Math.floor(Math.abs(size) / 1024);
  const divider = rangeIndex * 1024 || 1;
  const formattedSize = (size / divider).toFixed(rangeIndex ? 2 : 0);
  return `${formattedSize} ${ranges[rangeIndex]}`;
}

function readFiles(pattern) {
  return glob.sync(pattern).map(file => {
    const buffer = readFileSync(file);
    return {
      name: file.split('/')[1],
      size: gzipSize.sync(buffer),
    };
  });
}

function getResults(filesBefore, filesAfter) {
  return filesAfter.reduce((result, file) => {
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
}

const TABLE_HEADER = [
  { key: 'name', label: 'file name', align: 'left' },
  { key: 'sizeBefore', label: 'size old', align: 'right' },
  { key: 'sizeAfter', label: 'size new', align: 'right' },
  { key: 'diff', label: 'diff', align: 'right' },
];

function measure(pattern = 'lib/*.js', task = 'npm run build') {
  // check file sizes before build
  const filesBefore = readFiles(pattern);
  // clean and build project
  execSync(task);
  // check file sizes after build
  const filesAfter = readFiles(pattern);

  const result = getResults(filesBefore, filesAfter);

  const table = {
    header: TABLE_HEADER,
    body: result,
  };

  printTable(table);
}

measure();
