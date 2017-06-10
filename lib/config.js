'use strict';
const fs = require('fs');
const path = require('path');

const appFolder = 'todocmd';
const configFile = 'config.json';

// Get application data folder
if (process.platform == 'win32')
{
  var folder = path.join(process.env.APPDATA, appfolder);
  var symbols = {
    ok: '\u221A',
    nok: '\u00D7'
  }
}
else
{
  let configFolder = path.join(process.env.HOME, '.config');
  if (!isDirSync(configFolder))
    fs.mkdirSync(configFolder);
  var folder = path.join(configFolder, appFolder);
  var symbols = {
    ok: '✓',
    nok: '✖',
  };
}

// First time running -> create config folder & files
if (!isFileSync(path.join(folder, configFile)))
{
  if (!isDirSync(folder))
    fs.mkdirSync(folder);
  let config = require('./default.json');
  fs.writeFileSync(path.join(folder, configFile), JSON.stringify(config));
}

/*
 * PRIVATE
 */
function isDirSync(aPath)
{
  try
  {
    return fs.statSync(aPath).isDirectory();
  }
  catch (e)
  {
    if (e.code === 'ENOENT')
      return false;
    else
      throw e;
  }
}

function isFileSync(aPath)
{
  try
  {
    return fs.statSync(aPath).isFile();
  }
  catch (e)
  {
    if (e.code === 'ENOENT')
      return false;
    else
      throw e;
  }
}


/*
 * MODULE EXPORTS
 */
module.exports = {
  _data: null,
  folder,
  symbols,
  get data()
  {
    if (this._data)
      return this._data;

    this._data = JSON.parse(fs.readFileSync(path.join(folder, configFile)));
    return this._data;
  },
  save: function()
  {
    if (!this._data)
      return false;

    fs.writeFileSync(path.join(folder, configFile), JSON.stringify(this._data));
    return true;
  }
};
