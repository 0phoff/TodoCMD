# TODO
This is the TODO list for the todoCMD app.

## V2 Checklist
This is an overview of everything that needs to be done for V2.0.0
  - [ ] *[ui.js]* blessed/ncurses UI

## V1.2 Checklist
This is an overview of everything that needs to be done for V1.2.0
  - [X] Change to XO coding style
  - [X] *[config.js]* Refactor config
  - [ ] *[cli_parser.js]* Refactor parser
  - [ ] *[cli_functions.js]* Refactor cli functions
  - [X] __issue #6__ flag behaviour
  - [X] __issue #7__ auto global folder
  - [ ] __issue #8__ Change inquirer multiline
  - [ ] __issue #4__ contributing page (wiki/contributing.md)
  - [X] __issue #9__ Change logo font to outline
  - [ ] _(optional)_ Cleanup tests
  - [ ] _(optional)_ Add GIF to README to show off how it works

## V1.1 Checklist
This is an overview of everything that needs to be done for V1.1.0
  - [X] Add markdown styling support
  - [X] __issue #5__ Replace chalk.dim
  - [X] __issue #2__ Add -l/-L differentiation
  - [X] __issue #3__ Add -n flag to _add_ & _ls add_ item at specified index
  - [X] __issue #4__ Create Wiki to explain all commands in depth

## V1 Checklist
This is an overview of everything that needs to be done for V1.0.0
  - [X] *[index.js]* Library export
  - [X] *[cli.js]* CLI commands
  - [X] *[todo.js]* Manage JS Todo objects
  - [X] *[md.js]* Parse & Write markdown files
  - [X] Update readme

## cli.js
  - [X] *[cli_parser.js]* Create CLI parser
  - [X] todo
  - [X] todo new
  - [X] todo list [-i] [regex]
  - [X] todo list add [title]
  - [X] todo list rm [regex]
  - [X] todo add [-l list] [item]
  - [X] todo rm [-l list] [regex]
  - [X] todo check [-l list] [-a] [regex]
  - [X] todo uncheck [-l list] [-a] [regex]
  - [ ] ~~_(optional)_ todo toggle [list]~~

## todo.js
  - [X] CRUD Projects
  - [X] Edit Project details
  - [X] CRUD Project Lists
  - [X] Edit List details
  - [X] CRUD List items

## md.js
  - [X] Parse markdown file to a JS Todo object
  - [X] Write a markdown file from a JS Todo object

