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
  return Promise.reject('TUI is not yet implemented... :\'(');
}

function newProject(options)
{
  let {filename, exists} = getFile(options, true);

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
      .then(answer => answer.overwrite ? Promise.resolve() : Promise.reject('overwrite'));
  }
  else
  {
    var inquiry = Promise.resolve();
  }

  return inquiry
    .then(() => inquirer.prompt(questions))
    .then(function(answers) {
      return md.writeFile(filename, new todo.Project(answers.title, answers.desc))
        .catch(err => console.error('There was an error whilst creating the file', err.message));
    })
    .catch(x => {
      if (x == 'overwrite')
        return Promise.resolve();
      else
        return Promise.reject(x);
    });
}

function list(options)
{
  let {filename, exists} = getFile(options);

  if (!exists)
    return Promise.reject(`Could not find the file ${filename}`);

  if (options.interactive)
    return listInteractive();
  else if (!options.argv.length)
    return listList();
  else
    return listRegexp();

  function listInteractive()
  {
    inquirer.registerPrompt('indexList', require('./inquirer_indexList'));

    return md.readFile(filename)
      .then(function(project) {
        if (!project.length)
          return Promise.reject('This project does not contain any lists');

        let question = {
          type: 'indexList',
          name: 'listindex',
          message: 'Pick a list:',
          choices: []
        };
        project._content.forEach(list => question.choices.push(list.title));

        inquirer.prompt(question)
          .then(answer => {
            let list = project.getList(answer.listindex);

            if (list.desc.length)
              console.log(chalk.dim(list.desc));

            list._content.forEach(item => {
              let done = item.done ? chalk.green(config.symbols.ok) : chalk.red(config.symbols.nok);
              console.log('  ' + done + ' ' + item.value);
            });
          });
      });
  }

  function listList()
  {
    return md.readFile(filename)
      .then(function(project) {
        if (project.title.length)
          console.log(chalk.cyan(project.title));
        if (project.desc.length)
          console.log(chalk.dim(project.desc));

        project._content.forEach(list => {
          console.log(chalk.cyan('  >> ') + list.title);
        });
      });
  }

  function listRegexp()
  {
    return md.readFile(filename)
      .then(function(project) {
        let search = options.argv.join('(.|\n)*');
        project.findLists(search).forEach(listindex => {
          let list = project.getList(listindex);

          if (list.title.length)
            console.log(chalk.cyan(list.title));
          if (list.desc.length)
            console.log(chalk.dim(list.desc));

          list._content.forEach(item => {
            let done = item.done ? chalk.green(config.symbols.ok) : chalk.red(config.symbols.nok);
            console.log('  ' + done + ' ' + item.value);
          });
          console.log();
        });
      });
  }
}


/*
 * PRIVATE
 */
function getFile(options, parseArgv)
{
  // Parse filename
  if (options.file)
    var filename = options.file;
  else if (parseArgv && options.argv.length)
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

  return {
    filename,
    exists
  };
}


/*
 * MODULE EXPORTS
 */
module.exports = {
  tui,
  newProject,
  list
};
