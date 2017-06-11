# TODO
This is the TODO list for the todoCMD app.

## V2 Checklist
This is an overview of everything that needs to be done for V2.0.0
  - [ ] (ui.js) blessed/ncurses UI

## V1.1 Checklist
This is an overview of everything that needs to be done for V1.1.0
  - [ ] Rewrite cli_parser.js
  - [ ] Rewrite cli_functions.js
  - [ ] (optional) Cleanup tests

## V1 Checklist
This is an overview of everything that needs to be done for V1.0.0
  - [X] (index.js) Library export
  - [X] (cli.js) CLI commands
  - [X] (todo.js) Manage JS Todo objects
  - [X] (md.js) Parse & Write markdown files
  - [ ] Update readme

## cli.js
  - [X] (cli_parser.js) Create CLI parser
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

