'use strict';
const fs = require('fs');
const todo = require('../todo');
const mdReader = require('./read');
const MdWriter = require('./write');

/*
 * PUBLIC API
 */
function readFile(filename) {
  return new Promise((resolve, reject) => {
    const project = new todo.Project();
    const splitter = new mdReader.SplitParagraphs();
    const deserializer = new mdReader.Deserialize(project);

    fs.createReadStream(filename, 'utf8')
        .on('error', err => reject(err))
      .pipe(splitter)
        .on('error', err => reject(err))
      .pipe(deserializer)
        .on('error', err => reject(err))
        .on('finish', () => resolve(project));
  });
}

function writeFile(filename, object) {
  return new Promise((resolve, reject) => {
    const dataStream = new MdWriter(object);
    const fileStream = fs.createWriteStream(filename);

    dataStream
      .on('error', err => reject(err))
    .pipe(fileStream)
      .on('error', err => reject(err))
      .on('finish', () => resolve());
  });
}

/*
 * MODULE EXPORTS
 */
module.exports = {
  readFile,
  writeFile
};
