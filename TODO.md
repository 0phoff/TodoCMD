# TODO
This is the TODO list for the todoCMD app.

## V2 Checklist
This is an overview of everything that needs to be done for V2.0.0
  - [ ] (ui.js) blessed/ncurses UI

## V1.2 Checklist
This is an overview of everything that needs to be done for V1.2.0
  - [ ] Rewrite cli_parser.js & cli_functions.js to be faster
  - [ ] Change inquirer editor mode to multiline
  - [ ] _(optional)_ Cleanup tests
  - [ ] _(optional)_ Add GIF to README to show off how it works

## V1.1 Checklist
This is an overview of everything that needs to be done for V1.1.0
  - [X] Add markdown styling support
  - [ ] __issue #2__ Add -l/-L differentiation
  - [ ] __issue #3__ Add -n flag to add/rm item at specified index
  - [ ] Create Wiki to explain all commands in depth

## V1 Checklist
This is an overview of everything that needs to be done for V1.0.0
  - [X] _(index.js)_ Library export
  - [X] _(cli.js)_ CLI commands
  - [X] _(todo.js)_ Manage JS Todo objects
  - [X] _(md.js)_ Parse & Write markdown files
  - [X] Update readme

## cli.js
  - [X] _(cli_parser.js)_ Create CLI parser
  - [X] todo
  - [X] todo new
  - [X] todo list [-i] [regex]
  - [X] todo list add [title]
  - [X] todo list rm [regex]
  - [X] todo add [-l list] [item]
  - [X] todo rm [-l list] [regex]
  - [X] todo check [-l list] [-a] [regex]
  - [X] todo uncheck [-l list] [-a] [regex]
  - [ ] (optional) todo toggle [list] 

## todo.js
  - [X] CRUD Projects
  - [X] Edit Project details
  - [X] CRUD Project Lists
  - [X] Edit List details
  - [X] CRUD List items

## md.js
  - [X] Parse markdown file to a JS Todo object
  - [X] Write a markdown file from a JS Todo object

