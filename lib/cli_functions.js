'use strict';
const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { todo,md } = require('..');
const config = require('./config');

/*
 * PUBLIC
 */
function tui(options)
{
  logError('TUI is not yet implemented... :\'(');
}

function newProject(options)
{
  // Parse filename
  if (options.file)
    var filename = options.file;
  else if (options.argv.length)
    var filename = options.argv.join("_");
  else
    var filename = config.data.defaultFileName;

  if (path.extname(filename) != '.md')
    filename = filename + '.md';

  if (options.global)
    filename = path.join(config.folder, filename);

  // Check if file already exists
  try
  {
    var exists = fs.statSync(filename).isFile();
  }
  catch (e)
  {
    var exists = false;
  };

  // Inquirer
  let questions = [
    {
      type: 'input',
      name: 'title',
      message: 'Title: ',
      default: path.basename(filename, '.md')
    },
    {
      type: 'editor',
      name: 'desc',
      message: 'Description:'
    }
  ];

  if (exists)
  {
    var inquiry = Promise.resolve()
      .then(() => inquirer.prompt([{type: 'confirm', name: 'overwrite', message: 'File already exists! Overwrite? ', default: false}]))
      .then(answer => answer.overwrite ? Promise.resolve() : Promise.reject());
  }
  else
  {
    var inquiry = Promise.resolve();
  }

  return inquiry
    .then(() => inquirer.prompt(questions))
    .then(function(answers) {
      return md.writeFile(filename, new todo.Project(answers.title, answers.desc))
        .catch(err => console.error('There was an error whilst creating the file!', err.message));
    })
    .catch(x => x);
}



/*
 * PRIVATE
 */
function logError(...msgs)
{
  return console.log(chalk.red(...msgs));
}


/*
 * MODULE EXPORTS
 */
module.exports = {
  tui,
  newProject,
};
