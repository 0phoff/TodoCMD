'use strict';
const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const chalk = require('chalk');
const todo = require('../todo');
const md = require('../md/md');
const config = require('../config');

/*
 * PUBLIC
 */
function tui(options) {
  return Promise.reject(new TypeError('TUI is not yet implemented...', options.argv));
}

function newProject(options) {
  inquirer.registerPrompt('multiline', require('../inquirer-multiline'));
  // Parse filename
  let filename;
  if (options.file) {
    filename = options.file;
  }
  else if (options.argv.length === 0) {
    filename = config.data.defaultFileName;
  }
  else {
    filename = options.argv.join('_');
  }
  if (path.extname(filename) !== '.md') {
    filename += '.md';
  }
  if (options.global) {
    filename = path.join(config.folder, filename);
  }

  // Check file
  const exists = fileCheck(filename);

  // Inquirer
  const questions = [
    {
      type: 'input',
      name: 'title',
      message: 'Title: ',
      default: path.basename(filename, '.md')
    },
    {
      type: 'multiline',
      name: 'desc',
      message: 'Description: '
    }
  ];

  let inquiry;
  if (exists) {
    inquiry = Promise.resolve()
      .then(() => inquirer.prompt([{type: 'confirm', name: 'overwrite', message: 'File already exists! Overwrite? ', default: false}]))
      .then(answer => answer.overwrite ? Promise.resolve() : Promise.reject(new Error('overwrite')));
  }
  else {
    inquiry = Promise.resolve();
  }

  return inquiry
    .then(() => inquirer.prompt(questions))
    .then(answers => {
      return md.writeFile(filename, new todo.Project(answers.title, answers.desc))
        .catch(err => Promise.reject(new Error(`Something went wrong writing the file: ${err.message}`)));
    })
    .catch(x => {
      if (x.message === 'overwrite') {
        return Promise.resolve();
      }
      return Promise.reject(x);
    });
}

function list(options) {
  const {filename, exists} = getFile(options);
  if (!exists) {
    return Promise.reject(new Error(`Could not find the file: ${filename}`));
  }

  if (options.interactive) {
    return listInteractive();
  }
  if (options.argv.length !== 0) {
    return listRegexp();
  }
  return listList();

  function listInteractive() {
    return md.readFile(filename)
      .then(project => {
        return getLists(project, 'list', 'Pick a list:', {autoresolve: false})
          .then(listindex => {
            const list = project.getList(listindex[0]);

            if (list.desc.length !== 0) {
              console.log(chalk.gray(printMD(list.desc)));
            }

            list._content.forEach(item => {
              if ((!options.checked && !options.unchecked) || (options.checked && item.done) || (options.unchecked && !item.done)) {
                const done = item.done ? chalk.green(config.symbols.ok) : chalk.red(config.symbols.nok);
                console.log('  ' + done + ' ' + printMD(item.value));
              }
            });
          });
      });
  }

  function listList() {
    return md.readFile(filename)
      .then(project => {
        if (project.title.length !== 0) {
          console.log(chalk.cyan(printMD(project.title)));
        }
        if (project.desc.length !== 0) {
          console.log(chalk.gray(printMD(project.desc)));
        }

        project._content.forEach(list => {
          console.log(chalk.cyan('  >> ') + printMD(list.title));
        });
      });
  }

  function listRegexp() {
    return md.readFile(filename)
      .then(project => {
        const search = options.argv.join('[^]*');
        project.findLists(search, !options.limit).forEach(listindex => {
          const list = project.getList(listindex);

          if (list.title.length !== 0) {
            console.log(chalk.cyan(printMD(list.title)));
          }
          if (list.desc.length !== 0) {
            console.log(chalk.gray(printMD(list.desc)));
          }

          list._content.forEach(item => {
            if ((!options.checked && !options.unchecked) || (options.checked && item.done) || (options.unchecked && !item.done)) {
              const done = item.done ? chalk.green(config.symbols.ok) : chalk.red(config.symbols.nok);
              console.log('  ' + done + ' ' + printMD(item.value));
            }
          });
          console.log();
        });
      });
  }
}

function listAdd(options) {
  inquirer.registerPrompt('multiline', require('../inquirer-multiline'));
  const {filename, exists} = getFile(options);
  if (!exists) {
    return Promise.reject(new Error(`Could not find the file: ${filename}`));
  }

  return md.readFile(filename)
    .then(project => {
      let listName;
      if (options.argv.length === 0) {
        listName = 'List ' + (project.length + 1);
      }
      else {
        listName = options.argv.join(' ');
      }

      const questions = [
        {
          type: 'input',
          name: 'title',
          message: 'Title: ',
          default: listName
        },
        {
          type: 'multiline',
          name: 'desc',
          message: 'Description: '
        }
      ];
      return inquirer.prompt(questions)
        .then(answers => {
          project.insertList(new todo.List(answers.title, answers.desc), Number(options.number) - 1);
          return md.writeFile(filename, project);
        });
    });
}

function listRm(options) {
  inquirer.registerPrompt('specialCheckbox', require('../inquirer-custom-checkbox'));
  const {filename, exists} = getFile(options);
  if (!exists) {
    return Promise.reject(new Error(`Could not find the file: ${filename}`));
  }

  function remove(project, lists) {
    lists.sort((a, b) => b - a);
    const listProm = [];

    lists.forEach(index => {
      const list = project.getList(index);
      let p;
      if (list.length === 0) {
        p = Promise.resolve({delete: true});
      }
      else {
        p = inquirer.prompt({type: 'confirm', name: 'delete', message: `${printMD(list.title)} is not empty! Remove anyway?`, default: false});
      }

      listProm.push(p);
      p.then(answer => {
        if (answer.delete) {
          project.removeList(index);
        }
      });
    });

    return Promise.all(listProm).then(() => md.writeFile(filename, project));
  }

  return md.readFile(filename)
    .then(project => {
      let search;
      if (options.argv.length !== 0) {
        search = options.argv.join('[^]*');
      }

      return getLists(project, 'specialCheckbox', 'Pick the list you want to remove:', {search, desc: !options.limit, autoresolve: true, all: options.all})
        .then(listindices => {
          if (listindices.length === 0) {
            return Promise.reject(new Error('No list selected'));
          }
          return remove(project, listindices);
        });
    });
}

function itemAdd(options) {
  const {filename, exists} = getFile(options);
  if (!exists) {
    return Promise.reject(new Error(`Could not find the file: ${filename}`));
  }

  return md.readFile(filename)
    .then(project => {
      let list;
      let desc;
      if (options.List) {
        list = options.List;
        desc = true;
      }
      else {
        list = options.list;
        desc = false;
      }

      return getLists(project, 'list', 'Pick a list:', {search: list, desc, autoresolve: true})
        .then(listindex => {
          let p;
          if (options.argv.length === 0) {
            p = inquirer.prompt({type: 'input', name: 'value', message: 'Item\'s text: ', default: 'Todo'}).then(answers => answers.value);
          }
          else {
            p = Promise.resolve(options.argv.join(' '));
          }

          return p
            .then(value => project.getList(listindex[0]).insertItem(value, false, Number(options.number) - 1))
            .then(() => md.writeFile(filename, project));
        });
    });
}

function itemRm(options) {
  inquirer.registerPrompt('specialCheckbox', require('../inquirer-custom-checkbox'));
  const {filename, exists} = getFile(options);
  if (!exists) {
    return Promise.reject(new Error(`Could not find the file: ${filename}`));
  }

  return md.readFile(filename)
    .then(project => {
      let search;
      let list;
      let desc;
      if (options.argv.length !== 0) {
        search = options.argv.join('.*');
      }
      if (options.List) {
        list = options.List;
        desc = true;
      }
      else {
        list = options.list;
        desc = false;
      }

      return getItems(project, 'specialCheckbox', 'Pick the items you want to remove:', {listSearch: list, listDesc: desc, search, all: options.all})
        .then(itemindices => {
          if (itemindices.length === 0) {
            return Promise.reject(new Error('No items selected'));
          }

          itemindices.sort((a, b) => b.index - a.index);
          itemindices.forEach(item => item.list.removeItem(item.index));
          return md.writeFile(filename, project);
        });
    });
}

function itemMark(value, options) {
  inquirer.registerPrompt('specialCheckbox', require('../inquirer-custom-checkbox'));
  const {filename, exists} = getFile(options);
  if (!exists) {
    return Promise.reject(new Error(`Could not find the file: ${filename}`));
  }

  function disable(item) {
    if (item.value.list.getItem(item.value.index).done === value) {
      return 'Already ' + (value ? 'checked' : 'unchecked');
    }
    return false;
  }

  return md.readFile(filename)
    .then(project => {
      let search;
      let msg;
      let list;
      let desc;
      if (options.argv.length !== 0) {
        search = options.argv.join('.*');
      }

      if (value) {
        msg = 'Pick the items you want to check:';
      }
      else {
        msg = 'Pick the items you want to uncheck:';
      }

      if (options.List) {
        list = options.List;
        desc = true;
      }
      else {
        list = options.list;
        desc = false;
      }

      return getItems(project, 'specialCheckbox', msg, {listSearch: list, listDesc: desc, search, disable, all: options.all})
        .then(itemindices => {
          if (itemindices.length === 0) {
            return Promise.reject(new Error('No items selected'));
          }

          itemindices.forEach(item => item.list.markItem(item.index, value));
          return md.writeFile(filename, project);
        });
    });
}

/*
 * PRIVATE
 */
function fileCheck(file) {
  let exists;
  try {
    exists = fs.statSync(file).isFile();
  }
  catch (err) {
    exists = false;
  }
  return exists;
}

function getFile(options) {
  // Parse filename
  let filename;
  if (options.file) {
    filename = options.file;
  }
  else {
    filename = config.data.defaultFileName;
  }

  // Check if file already exists
  let folder = process.cwd();
  for (let i = 0; i <= 1; ++i) {
    if (options.global) {
      folder = config.folder;
      ++i;
    }

    let test = path.join(folder, filename);
    if (fileCheck(test)) {
      return {
        filename: test,
        exists: true
      };
    }
    test = path.join(folder, '.' + filename);
    if (fileCheck(test)) {
      return {
        filename: test,
        exists: true
      };
    }
    if (path.extname(filename) !== '.md') {
      test = path.join(folder, filename + '.md');
      if (fileCheck(test)) {
        return {
          filename: test,
          exists: true
        };
      }
      test = path.join(folder, '.' + filename + '.md');
      if (fileCheck(test)) {
        return {
          filename: test,
          exists: true
        };
      }
    }

    folder = config.folder;
  }

  return {
    filename,
    exists: false
  };
}

function getLists(project, type, message, {search, desc, autoresolve, all}) {
  if (project.length === 0) {
    return Promise.reject(new Error('This project does not contain any lists'));
  }

  const question = {
    type,
    name: 'listindices',
    message,
    pageSize: config.data.maxListSize,
    choices: []
  };

  if (search) {
    const listindices = project.findLists(search, desc);
    if (listindices.length === 0) {
      return Promise.reject(new Error(`Could not find a list that matched with ${search}`));
    }

    if (all || (listindices.length === 1 && autoresolve)) {
      return Promise.resolve(listindices);
    }

    listindices.forEach(index => {
      const list = project.getList(index);
      question.choices.push({value: index, name: printMD(list.title)});
    });
  }
  else {
    if (all) {
      return Promise.resolve([...Array(project.length).keys()]);
    }

    if (project.length === 1 && autoresolve) {
      return Promise.resolve([0]);
    }
    project._content.forEach((list, index) => question.choices.push({value: index, name: printMD(list.title)}));
  }

  return inquirer.prompt(question)
    .then(answers => {
      if (Array.isArray(answers.listindices)) {
        return answers.listindices;
      }
      return [answers.listindices];
    });
}

function getItems(project, type, message, {listSearch, listDesc, search, all, disable}) {
  if (project.length === 0) {
    return Promise.reject(new Error('This project does not contain any lists'));
  }

  // Get lists
  let lists;
  if (listSearch) {
    const listindices = project.findLists(listSearch, listDesc);
    if (listindices.length === 0) {
      return Promise.reject(new Error(`Could not find a list that matched with ${listSearch}`));
    }

    lists = [];
    listindices.forEach(index => lists.push(project.getList(index)));
  }
  else {
    lists = project._content;
  }

  // Get items
  const question = {
    type,
    name: 'items',
    message,
    pageSize: config.data.maxListSize,
    choices: []
  };

  if (search) {
    lists.forEach(list => {
      const itemindices = list.findItems(search);
      if (itemindices.length !== 0) {
        question.choices.push(new inquirer.Separator(printMD(list.title)));
      }
      itemindices.forEach(index => {
        const item = list.getItem(index);
        question.choices.push({value: {list, index}, name: printMD(item.value)});
      });
    });

    if (question.choices.length === 0) {
      return Promise.reject(new Error(`Could not find an item that matched with ${search}`));
    }
  }
  else {
    lists.forEach(list => {
      if (list.length !== 0) {
        question.choices.push(new inquirer.Separator(printMD(list.title)));
      }
      list._content.forEach((item, index) => {
        question.choices.push({value: {list, index}, name: printMD(item.value)});
      });
    });

    if (question.choices.length === 0) {
      return Promise.reject(new Error('This project does not contain any items'));
    }
  }

  if (question.choices.length === 2) {
    return Promise.resolve([question.choices[1].value]);
  }

  if (all) {
    const answer = [];
    question.choices.forEach(choice => {
      if (choice.value) {
        answer.push(choice.value);
      }
    });
    return Promise.resolve(answer);
  }

  if (disable) {
    question.choices.forEach(choice => {
      if (choice.value) {
        choice.disabled = disable(choice);
      }
    });
  }

  return inquirer.prompt(question)
    .then(answers => {
      if (Array.isArray(answers.items)) {
        return answers.items;
      }
      return [answers.items];
    });
}

function printMD(string) {
  string = string.replace(/__([^_\n].+?)__/g, chalk.bold('$1'));
  string = string.replace(/\*\*([^*\n].+?)\*\*/g, chalk.bold('$1'));

  string = string.replace(/_([^_\n].+?)_/g, chalk.italic('$1'));
  string = string.replace(/\*([^*\n].+?)\*/g, chalk.italic('$1'));

  if (config.data.strikethrough) {
    string = string.replace(/~~([^~\n].+?)~~/g, chalk.strikethrough('$1'));
  }
  else {
    string = string.replace(/~~([^~\n].+?)~~/g, chalk.underline('$1'));
  }

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
