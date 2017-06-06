#!/usr/bin/env node
'use strict';
const program = require('./cli_parser');

// Common info
program
  .version('0.0.1')
  .globalDescription('A CLI to manage markdown formatted todo\'s\n  www.github.com/0phoff/TodoCMD');

// todo
program
  .description('Open the todo project in a terminal UI')
  .flag('f', 'file', true, 'Name of the todo file')
  .flag('g', 'global', false, 'Global todo project')
  .argument('filename', false)
  .action(options => console.error('TUI is not yet implemented...'));

// todo new
program
  .command('new')
  .description('Create a new todo project file')
  .argument('filename', false)
  .action(options => console.error('"todo new" not yet implemented...'));

// todo list
let list = program
  .command('list')
  .alias('l')
  .description('Show list & items from list')
  .privateFlag('i', 'interactive', false, 'Interactive mode')
  .argument('regexp', false)
  .action(options => console.error('"todo list" not yet implemented...\n',options));

/// todo list add
list
  .command('add')
  .description('Add a todo list to a project')
  .argument('title', false)
  .action(options => console.error('"todo list add" not yet implemented...'));

/// todo list rm
list
  .command('rm')
  .description('Remove a todo list from a project')
  .argument('regexp', false)
  .action(options => console.error('"todo list rm" not yet implemented...\n',options));

// todo add
program
  .command('add')
  .description('Add a todo item to a list')
  .flag('l', 'list', true, 'Number|RegExp to identify the list')
  .argument('item', false)
  .action(options => console.error('"todo add" not yet implemented...'));

// todo rm
program
  .command('rm')
  .description('Remove a todo item from a list')
  .flag('l', 'list', true, 'Number|RegExp to identify the list')
  .argument('number|regexp', false)
  .action(options => console.error('"todo rm" not yet implemented...\n',options));

// todo check
program
  .command('check')
  .alias('v')
  .description('Check a todo item from a list')
  .flag('l', 'list', true, 'Number|RegExp to identify the list')
  .argument('number|regexp', false)
  .action(option => console.error('"todo check" not yet implemented...'));

// todo uncheck
program
  .command('uncheck')
  .alias('x')
  .description('Uncheck a todo item from a list')
  .flag('l', 'list', true, 'Number|RegExp to identify the list')
  .argument('number|regexp', false)
  .action(option => console.error('"todo uncheck" not yet implemented...'));

// todo toggle
program
  .command('toggle')
  .description('Toggle a todo item from a list')
  .flag('l', 'list', true, 'Number|RegExp to identify the list')
  .argument('number|regexp', false)
  .action(option => console.error('"todo toggle" not yet implemented...'));

program.start();
