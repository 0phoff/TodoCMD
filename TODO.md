# TODO
This is the TODO list for the todoCMD app.

## Overview functionality
This list contains an overview of everything that needs to be done.
  - [ ] (index.js) Library export
  - [ ] (cli.js) CLI commands
  - [X] (todo.js) Manage JS Todo objects
  - [X] (md.js) Parse & Write markdown files
  - [ ] (ui.js) blessed/ncurses UI

## cli.js
  - [X] (cli_parser.js) Create CLI parser
  - [ ] todo                                        -> Open project [filename] in ncurses
  - [ ] tood new                                    -> Create new project [filename]
  - [ ] todo list [-i] [regex]                      -> If [num/regex] -> Show items from list; Else -> Show lists from [filename]
  - [ ] todo list add [title]                       -> Add new list to [filename]
  - [ ] todo list rm [regex]                        -> Rm list from [filename] (number or regex)
  - [ ] todo add [-l list] [item]                   -> Add item to [list] 
  - [ ] todo rm [-l list] [num|regex]               -> Rm item from [list] (number or regex)
  - [ ] todo check [-l list] [-a] [num|regex]       -> Check item from [list] (number or regex)
  - [ ] todo uncheck [-l list] [-a] [num|regex]     -> Uncheck item from [list] (number or regex)
  - [ ] todo toggle [-l list] [num|regex]           -> Toggle item from [list] (number or regex)

## todo.js
  - [X] CRUD Projects
  - [X] Edit Project details
  - [X] CRUD Project Lists
  - [X] Edit List details
  - [X] CRUD List items

## md.js
  - [X] Parse markdown file to a JS Todo object
  - [X] Write a markdown file from a JS Todo object

