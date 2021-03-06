#!/usr/bin/env node
'use strict';
const chalk = require('chalk');
const program = require('./parser');
const cli = require('./functions');

// Common info
program
  .version('2.0.1')
  .globalDescription('A CLI to manage markdown formatted todo\'s\n  ' + chalk.gray('www.github.com/0phoff/TodoCMD'))
  .globalFlag('f', 'file', true, 'Name of the todo file')
  .globalFlag('g', 'global', false, 'Global todo project');

// Cmd
program
  .description('Open the todo project in a terminal UI')
  .argument('filename', false)
  .action(cli.tui);

// Cmd new
program
  .command('new')
  .description('Create a new todo project file')
  .argument('filename', false)
  .action(cli.newProject);

// Cmd list
const list = program
  .command('list')
  .alias('ls')
  .description('Show list & items from list')
  .flag('i', 'interactive', false, 'Interactive mode')
  .flag('l', 'limit', false, 'Limit the RegExp to only match with titles')
  .flag('v', 'checked', false, 'Only show checked items')
  .flag('x', 'unchecked', false, 'Only show unchecked items')
  .argument('regexp', false)
  .action(cli.list);

// Cmd list add
list
  .command('add')
  .description('Add a todo list to a project')
  .flag('n', 'number', true, 'Index for the new list')
  .argument('title', false)
  .action(cli.listAdd);

// Cmd list rm
list
  .command('rm')
  .description('Remove a todo list from a project')
  .flag('l', 'limit', false, 'Limit the RegExp to only match with titles')
  .flag('a', 'all', false, 'Delete all matched lists')
  .argument('regexp', false)
  .action(cli.listRm);

// Cmd add
program
  .command('add')
  .description('Add a todo item to a list')
  .flag('l', 'list', true, 'RegExp to identify the list by title')
  .flag('L', 'List', true, 'RegExp to identify the list by title and description')
  .flag('n', 'number', true, 'Index for the new item')
  .argument('item', false)
  .action(cli.itemAdd);

// Cmd rm
program
  .command('rm')
  .description('Remove a todo item from a list')
  .flag('l', 'list', true, 'RegExp to identify the list by title')
  .flag('L', 'List', true, 'RegExp to identify the list by title and description')
  .flag('a', 'all', false, 'Delete all matched items')
  .argument('regexp', false)
  .action(cli.itemRm);

// Cmd check
program
  .command('check')
  .alias('v')
  .description('Check a todo item from a list')
  .flag('l', 'list', true, 'RegExp to identify the list by title')
  .flag('L', 'List', true, 'RegExp to identify the list by title and description')
  .flag('a', 'all', false, 'Check all the matched items')
  .argument('regexp', false)
  .action(cli.itemMark.bind(null, true));

// Cmd uncheck
program
  .command('uncheck')
  .alias('x')
  .description('Uncheck a todo item from a list')
  .flag('l', 'list', true, 'RegExp to identify the list by title')
  .flag('L', 'List', true, 'RegExp to identify the list by title and description')
  .flag('a', 'all', false, 'Uncheck all the matched items')
  .argument('number|regexp', false)
  .action(cli.itemMark.bind(null, false));

program
  .start()
  .catch(err => console.log(chalk.red(err.message)));
