# TODO
This is the TODO list for the TodoCMD application

## V3
This is an overview of everything that needs to be done for V300
  - [ ] __[ui.js]__ Blessed TUI

## ↳  ui.js
  - [ ] Base UI and event parsing
  - [ ] Browse todo *(arrows & hjkl)*
  - [ ] Browse todo lists *(tab)*
  - [ ] Command bar and command parsing
  - [ ] *(command)* Add|rm list
  - [ ] *(command)* Move list
  - [ ] *(command)* Add|rm|copy|paste items
  - [ ] *(command)* Move items
  - [ ] *(command)* Mark items
  - [ ] *(command)* Edit items

## V2.0.2
This is an overview of everything that needs to be done for V202
  - [ ] __[cli_parser.js]__ Move out cli_parser to own package
  - [ ] __[cli_functions.js]__ Refactor cli functions
  - [ ] *(optional)* Cleanup tests

## V2.0.1
This is an overview of everything that needs to be done for V201
  - [X] Add .npmignore/files section in package.json
  - [X] Change inquirer prompts to XO coding style
  - [X] __issue #10__ Add todo rm --all
  - [X] __issue #11__ option to only list (un)completed tasks

## V2
This is an overview of everything that needs to be done for V200
  - [X] Change to XO coding style
  - [X] __[config.js]__ Refactor config
  - [X] __issue #6__ Flag behaviour
  - [X] __issue #7__ Auto global folder
  - [X] __issue #8__ Change inquirer multiline
  - [X] __issue #4__ Contributing page (wiki/contributing.md)
  - [X] __issue #9__ Change logo font to outline
  - [X] *(optional)* Add GIF to README to show off how it works

## V1.1
This is an overview of everything that needs to be done for V110
  - [X] Add markdown styling support
  - [X] __issue #5__ Replace chalk.dim
  - [X] __issue #2__ Add -l/-L differentiation
  - [X] __issue #3__ Add -n flag to _add_ & _ls add_ item at specified index
  - [X] __issue #4__ Create Wiki to explain all commands in depth

## V1
This is an overview of everything that needs to be done for V100
  - [X] __[index.js]__ Library export
  - [X] __[cli.js]__ CLI commands
  - [X] __[todo.js]__ Manage JS Todo objects
  - [X] __[md.js]__ Parse & Write markdown files
  - [X] Update readme

## ↳  cli.js
  - [X] __[cli_parser.js]__ Create CLI parser
  - [X] todo
  - [X] todo new
  - [X] todo list
  - [X] todo list add
  - [X] todo list rm
  - [X] todo add
  - [X] todo rm
  - [X] todo check
  - [X] todo uncheck
  - [ ] ~~*(optional)* todo toggle~~

## ↳  todo.js
  - [X] CRUD Projects
  - [X] Edit Project details
  - [X] CRUD Project Lists
  - [X] Edit List details
  - [X] CRUD List items

## ↳  md.js
  - [X] Parse markdown file to a JS Todo object
  - [X] Write a markdown file from a JS Todo object

