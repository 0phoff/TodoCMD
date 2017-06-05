'use strict';
const fs = require('fs');
const todo = require('./todo.js')
const mdParser = require('./md_parse');
const mdWriter = require('./md_write');

/*
 * PUBLIC API
 */
function readFile(filename)
{
  return new Promise(function(resolve, reject) {
    let project = new todo.Project();
    let splitter = new mdParser.SplitParagraphs();
    let deserializer = new mdParser.Deserialize(project);

    fs.createReadStream(filename, 'utf8')
        .on('error', err => reject(err))
      .pipe(splitter)
        .on('error', err => reject(err))
      .pipe(deserializer)
        .on('error', err => reject(err))
        .on('finish', () => resolve(project));
  });
}

function writeFile(filename, object)
{
  return new Promise(function(resolve, reject) {
    let dataStream = new mdWriter(object);
    let fileStream = fs.createWriteStream(filename);

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
