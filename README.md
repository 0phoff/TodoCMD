![TodoCMD][logo]

  A basic CLI to manage markdown formatted TODO lists.

  [![NPM Version][npm-version-img]][npm-url]
  [![NPM Downloads][npm-dl-img]][npm-url]
  ![Build][build-img]
  [![Coverage][cov-img]][cov-url]
  
## Features
  - [X] Create and Manage TODO files with multiple lists
  - [X] Personal TODO files in the Home directory
  - [X] TODO files are saved as markdown
  - [ ] NCurses based Terminal UI
  
Take a look at this project's [TODO.md][todo-url]. It was created using this CLI!

## Installation
  > npm install todocmd -g

That's all! _(assuming you have [node][node-url] already installed)_  
The first time you use this CLI, it will create a directory to store a config.json file.  
This is also the location where global TODO files will be stored.  
  - Linux   : HOME/.config/todocmd
  - Mac     : HOME/.config/todocmd
  - Windows : APPDATA/todocmd

## Usage
Here is a short summary of the commands that TodoCMD offers. You can use the --help (-h) flag on any command to get more information about the specific options that this command has.  
~~For a more detailed explanation, go to the wiki.~~ (not yet done)  

__todo new__  
This command will create a new markdown file with a title and a description.

__todo list__  
_todo ls_  
This command will list all the TODO lists a file has. If the name of a list is provided, it will instead show all the items from that list.

__todo list add__  
_todo ls add_  
Use this command to add a TODO list to a file.

__todo list rm__  
_todo ls rm_  
Use this command to remove a TODO list to a file.

__todo add__  
This command will add an item to a TODO list.

__todo rm__  
This command will remove an item from a list.

__todo check__  
_todo v_  
This command will mark an item as done.

__todo uncheck__  
_todo x_  
This command will mark an item as not done.

## Background
After learning a lot about JS and NodeJS through books, guides and videos, I decided to put my newfound skills to the test and create an application.
I tend to use a lot of TODO files in my personal projects, and wanted a good way to manage them, whilst still being able to easily read the raw file.
Thus, the idea for TodoCMD was born.

[logo]:             https://rawgit.com/0phoff/TodoCMD/master/assets/logo.svg
[npm-version-img]:  https://img.shields.io/npm/v/todocmd.svg
[npm-dl-img]:       https://img.shields.io/npm/dt/todocmd.svg
[npm-url]:          https://npmjs.org/package/todocmd
[build-img]:        https://rawgit.com/0phoff/TodoCMD/master/assets/build.svg
[cov-img]:          https://rawgit.com/0phoff/TodoCMD/master/assets/coverage.svg
[cov-url]:          https://0phoff.github.io/TodoCMD
[pay-img]: unknown
[pay-url]: unknown
[todo-url]:         https://github.com/0phoff/TodoCMD/blob/master/TODO.md
[node-url]:         https://nodejs.org
