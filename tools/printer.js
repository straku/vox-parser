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

function getProperties(table) {
  const { header, body } = table;
  let properties = {};
  header.forEach(({ key, label, align }) => {
    properties[key] = {
      align,
      width: Math.max(label.length, ...body.map(row => row[key].length)),
    };
  });
  return properties;
}

function getTotalWidth(properties, padding = 1, separator = '|') {
  const keys = Object.keys(properties);
  const w = keys.reduce((total, key) => total + properties[key].width, 0);
  return w + keys.length * (2 * padding) + (keys.length - 1) * separator.length;
}

function addPadding(string, left, right = left) {
  const leftPadding = ' '.repeat(left);
  const rightPadding = ' '.repeat(right);
  return leftPadding + string + rightPadding;
}

function printHeader(header, properties, padding = 1, separator = '|') {
  const columns = header.map(column => {
    const props = properties[column.key];
    const pad = props.align === 'left' ? padRight : padLeft;
    return pad(addPadding(column.label, padding), props.width + 2 * padding);
  });
  return columns.join(separator);
}

function printBody(body, properties, padding = 1, separator = '|') {
  const rows = body.map(row => {
    const columns = Object.keys(row).map(key => {
      const props = properties[key];
      const pad = props.align === 'left' ? padRight : padLeft;
      return pad(addPadding(row[key], padding), props.width + 2 * padding);
    });
    return columns.join(separator);
  });
  return rows.join('\n');
}

function printSeparator(width, char = '-') {
  return '\n' + char.repeat(width) + '\n';
}

function printTable(table) {
  const { header, body } = table;
  const properties = getProperties(table);

  let buffer = '';

  buffer += '\n';
  buffer += printHeader(header, properties);
  buffer += printSeparator(getTotalWidth(properties));
  buffer += printBody(body, properties);
  buffer += '\n';

  console.log(buffer);
}

exports.printTable = printTable;
