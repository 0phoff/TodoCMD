'use strict';
const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
  inquirer.registerPrompt('specialCheckbox', require('./inquirer_specialCheckbox'));
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
      message: 'Description: '
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
        .catch(err => Promise.reject(`Something went wrong writing the file: ${err.message}`));
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
  {
    let retry = getFile({file: '.'+filename});
    exists = retry.exists;
    if (!exists)
      return Promise.reject(`Could not find the file: ${filename}`);
    filename = retry.filename;
  }

  if (options.interactive)
    return listInteractive();
  else if (!options.argv.length)
    return listList();
  else
    return listRegexp();

  function listInteractive()
  {
    return md.readFile(filename)
      .then(function(project) {     
        return getLists(project, 'list', 'Pick a list:')
          .then(listindex => {
            let list = project.getList(listindex[0]);
            
            if (list.desc.length)
              console.log(chalk.dim(printMD(list.desc)));
            
            list._content.forEach(item => {
              let done = item.done ? chalk.green(config.symbols.ok) : chalk.red(config.symbols.nok);
              console.log('  ' + done + ' ' + printMD(item.value));
            });
          });
      });
  }

  function listList()
  {
    return md.readFile(filename)
      .then(function(project) {
        if (project.title.length)
          console.log(chalk.cyan(printMD(project.title)));
        if (project.desc.length)
          console.log(chalk.dim(printMD(project.desc)));

        project._content.forEach(list => {
          console.log(chalk.cyan('  >> ') + printMD(list.title));
        });
      });
  }

  function listRegexp()
  {
    return md.readFile(filename)
      .then(function(project) {
        let search = options.argv.join('[^]*');
        project.findLists(search).forEach(listindex => {
          let list = project.getList(listindex);

          if (list.title.length)
            console.log(chalk.cyan(printMD(list.title)));
          if (list.desc.length)
            console.log(chalk.dim(printMD(list.desc)));

          list._content.forEach(item => {
            let done = item.done ? chalk.green(config.symbols.ok) : chalk.red(config.symbols.nok);
            console.log('  ' + done + ' ' + printMD(item.value));
          });
          console.log();
        });
      });
  }
}

function listAdd(options)
{
  let {filename, exists} = getFile(options);
  if (!exists)
  {
    let retry = getFile({file: '.'+filename});
    exists = retry.exists;
    if (!exists)
      return Promise.reject(`Could not find the file: ${filename}`);
    filename = retry.filename;
  }

  return md.readFile(filename)
    .then(function(project) {
      if (options.argv.length)
        var listName = options.argv.join(' ');
      else
        var listName = 'List ' + (project.length+1);

      let questions = [
        {
          type: 'input',
          name: 'title',
          message: 'Title: ',
          default: listName
        },
        {
          type: 'editor',
          name: 'desc',
          message: 'Description: '
        }
      ];
      return inquirer.prompt(questions)
        .then(answers => {
          project.insertList(new todo.List(answers.title, answers.desc));
          return md.writeFile(filename, project);
        });
    });
}

function listRm(options)
{
  let {filename, exists} = getFile(options);
  if (!exists)
  {
    let retry = getFile({file: '.'+filename});
    exists = retry.exists;
    if (!exists)
      return Promise.reject(`Could not find the file: ${filename}`);
    filename = retry.filename;
  }
  
  function remove(project, lists)
  {
    lists.sort((a,b) => b-a);
    let listProm = [];

    lists.forEach(index => {
      let list = project.getList(index);
      if (!list.length)
        var p = Promise.resolve({ delete: true });
      else
         p = inquirer.prompt({type: 'confirm', name: 'delete', message: `${printMD(list.title)} is not empty! Remove anyway?`, default: false});

      listProm.push(p);
      p.then(answer => {
        if (answer.delete)
          project.removeList(index);
      });
    });

    return Promise.all(listProm).then(() => md.writeFile(filename, project));
  }

  return md.readFile(filename)
    .then(function(project) {
      if (options.argv.length)
        var search = options.argv.join('[^]*');

      return getLists(project, 'specialCheckbox', 'Pick the list you want to remove:', search)
        .then(listindices => {
          if (!listindices.length)
            return Promise.reject('No list selected');
          return remove(project, listindices);
        });
    });
}

function itemAdd(options)
{
  let {filename, exists} = getFile(options);
  if (!exists)
  {
    let retry = getFile({file: '.'+filename});
    exists = retry.exists;
    if (!exists)
      return Promise.reject(`Could not find the file: ${filename}`);
    filename = retry.filename;
  }

  return md.readFile(filename)
    .then(function(project) {
      return getLists(project, 'list', 'Pick a list:', options.list)
        .then(listindex => {
          if (options.argv.length)
            var p = Promise.resolve(options.argv.join(' '));
          else
            var p = inquirer.prompt({type: 'input', name: 'value', message: 'Item\'s text: ', default: 'Todo'}).then(answers => answers.value);

          return p
            .then(value => project.getList(listindex[0]).insertItem(value))
            .then(() => md.writeFile(filename, project));
        });
    });
}

function itemRm(options)
{
  let {filename, exists} = getFile(options);
  if (!exists)
  {
    let retry = getFile({file: '.'+filename});
    exists = retry.exists;
    if (!exists)
      return Promise.reject(`Could not find the file: ${filename}`);
    filename = retry.filename;
  }

  return md.readFile(filename)
    .then(function(project) {
      if (options.argv.length)
        var search = options.argv.join('.*');
      
      return getItems(project, options.list, 'specialCheckbox', 'Pick the items you want to remove:', search)
        .then(itemindices => {
          if (!itemindices.length)
            return Promise.reject('No items selected');
          
          itemindices.sort((a,b) => b.index-a.index);
          itemindices.forEach(item => item.list.removeItem(item.index));
          return md.writeFile(filename, project);
        });
    });
}

function itemMark(value, options)
{
  let {filename, exists} = getFile(options);
  if (!exists)
  {
    let retry = getFile({file: '.'+filename});
    exists = retry.exists;
    if (!exists)
      return Promise.reject(`Could not find the file: ${filename}`);
    filename = retry.filename;
  }

  function disable(item)
  {
    if (item.value.list.getItem(item.value.index).done == value)
      return 'Already ' + (value ? 'checked':'unchecked');
    return false
  }

  return md.readFile(filename)
    .then(function(project) {
      if (options.argv.length)
        var search = options.argv.join('.*');

      if (value)
        var msg = 'Pick the items you want to check:';
      else
        var msg = 'Pick the items you want to uncheck:';

      return getItems(project, options.list, 'specialCheckbox', msg, search, disable, options.all)
        .then(itemindices => {
          if(!itemindices.length)
            return Promise.reject('No items selected');

          itemindices.forEach(item => item.list.markItem(item.index, value));
          return md.writeFile(filename, project);
        });
    });
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

function getLists(project, type, message, search)
{
  if (!project.length)
    return Promise.reject('This project does not contain any lists');

  let question = {
    type,
    name: 'listindices',
    message,
    pageSize: config.data.maxListSize,
    choices: []
  };
  if (search)
  {
    let listindices = project.findLists(search);
    if (!listindices.length)
      return Promise.reject(`Could not find a list that matched with ${search}`);

    if (listindices.length == 1)
      return Promise.resolve(listindices);
    else
      listindices.forEach(index => {
        let list = project.getList(index);
        question.choices.push({value: index, name: printMD(list.title)});
      });
  }
  else
  {
    project._content.forEach((list, index) => question.choices.push({value: index, name: printMD(list.title)}));
  }

  return inquirer.prompt(question)
    .then(answers => {
      if (!Array.isArray(answers.listindices))
        return [answers.listindices];
      else
        return answers.listindices;
    });
}

function getItems(project, listsearch, type, message, search, disable, all)
{
  if (!project.length)
    return Promise.reject('This project does not contain any lists');

  // Get lists
  if (listsearch)
  {
    let listindices = project.findLists(listsearch);
    if (!listindices.length)
      return Promise.reject(`Could not find a list that matched with ${listsearch}`);

    var lists = [];
    listindices.forEach(index => lists.push(project.getList(index)));
  }
  else
  {
    var lists = project._content;
  }

  // Get items
  let question = {
    type,
    name: 'items',
    message,
    pageSize: config.data.maxListSize,
    choices: [],
  };

  if (search)
  {
    lists.forEach(list => {
      let itemindices = list.findItems(search);
      if (itemindices.length)
        question.choices.push(new inquirer.Separator(printMD(list.title)));
      itemindices.forEach(index => {
        let item = list.getItem(index);
        question.choices.push({ value: {list, index}, name: printMD(item.value) });
      });
    });

    if (!question.choices.length)
      return Promise.reject(`Could not find an item that matched with ${search}`);
  }
  else
  {
    lists.forEach(list => {
      if (list.length)
        question.choices.push(new inquirer.Separator(printMD(list.title)));
      list._content.forEach((item, index) => {
        question.choices.push({ value: {list, index}, name: printMD(item.value) });
      });
    });

    if (!question.choices.length)
      return Promise.reject('This project does not contain any items');
  }

  if (question.choices.length == 2)
    return Promise.resolve([question.choices[1].value]);
  if (all)
  {
    let answer = [];
    question.choices.forEach(choice => {
      if (choice.value)
        answer.push(choice.value);
    });
    return Promise.resolve(answer);
  }

  if (disable)
  {
    question.choices.forEach(choice => {
      if (choice.value)
        choice.disabled = disable(choice);
    });
  }

  return inquirer.prompt(question)
    .then(answers => {
      if (!Array.isArray(answers.items))
        return [answers.items];
      else
        return answers.items;
    });
}

function printMD(string)
{
  string = string.replace(/__([^_\n].+)__/g, chalk.bold('$1'));
  string = string.replace(/\*\*([^*\n].+)\*\*/g, chalk.bold('$1'));

  string = string.replace(/_([^_\n].+)_/g, chalk.italic('$1'));
  string = string.replace(/\*([^*\n].+)\*/g, chalk.italic('$1'));

  if (config.data.strikethrough)
    string = string.replace(/~~([^~\n].+)~~/g, chalk.strikethrough('$1'));
  else
    string = string.replace(/~~([^~\n].+)~~/g, chalk.underline('$1'));

  return string;
}


/*
 * MODULE EXPORTS
 */
module.exports = {
  tui,
  newProject,
  list,
  listAdd,
  listRm,
  itemAdd,
  itemRm,
  itemMark
};
