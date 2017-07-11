'use strict';
const fs = require('fs');
const path = require('path');

const appFolder = 'todocmd';
const configFile = 'config.json';

// Set config options based on platform
let folder;
let symbols;
if (process.platform === 'win32') {
  folder = path.join(process.env.APPDATA, appFolder);
  symbols = {
    ok: '\u221A',
    nok: '\u00D7'
  };
}
else if (process.platform === 'darwin') {
  folder = path.join(process.env.HOME, 'Library', 'Preferences', appFolder);
  symbols = {
    ok: '✓',
    nok: '✖'
  };
}
else {
  folder = path.join(process.env.HOME, '.config', appFolder);
  symbols = {
    ok: '✓',
    nok: '✖'
  };
}


/*
 * MODULE EXPORTS
 */
module.exports = {
  _data: null,
  folder,
  symbols,
  get data() {
    if (this._data) {
      return this._data;
    }

    try {
      this._data = JSON.parse(fs.readFileSync(path.join(folder, configFile)));
    }
    catch (err) {
      fs.mkdirSync(folder);
      this._data = JSON.parse(fs.readFileSync(path.join(__dirname, 'default.json')));
      this.save();
    }

    return this._data;
  },
  save() {
    if (!this._data) {
      return false;
    }

    fs.writeFileSync(path.join(folder, configFile), JSON.stringify(this._data));
    return true;
  }
};
