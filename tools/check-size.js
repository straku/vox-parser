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

const header = [
  { key: 'name', label: 'file name', align: 'left' },
  { key: 'sizeBefore', label: 'size old', align: 'right' },
  { key: 'sizeAfter', label: 'size new', align: 'right' },
  { key: 'diff', label: 'diff', align: 'right' },
];

function getWidths(body) {
  const keys = header.map(column => column.key);
  const headerWidths = header.map(column => column.label.length);
  return keys.map((key, i) => {
    const headerColumnWidth = headerWidths[i];
    const maxBodyColumnWidth = body.reduce((width, row) => {
      const { length } = row[key];
      if (length > width) return length;
      return width;
    }, 0);
    return Math.max(headerColumnWidth, maxBodyColumnWidth);
  });
}

function getSeparator(width, char = '-') {
  return char.repeat(width);
}

function printTable(body) {
  const keys = header.map(c => c.name);
  const widths = getWidths(body).map(w => w + 1);
  const length = widths.reduce((total, w) => total + w, 0);

  let buffer = '';

  buffer += '\n';

  buffer += ' '; // padding left

  const tableHead = header
    .map((c, i) => {
      if (c.align === 'left') return padRight(c.label, widths[i]);
      else return padLeft(c.label, widths[i]);
    })
    .join(' |');

  buffer += tableHead;

  buffer += '\n';

  buffer += getSeparator(length + 8);

  buffer += '\n';

  buffer += body
    .map(
      file =>
        ' ' +
        [
          padRight(file.name, widths[0]),
          padLeft(file.sizeBefore, widths[1]),
          padLeft(file.sizeAfter, widths[2]),
          padLeft(file.diff, widths[3]),
        ].join(' |')
    )
    .join('\n');

  buffer += '\n';

  console.log(buffer);
}

printTable(result);
