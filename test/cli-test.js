/* eslint-env node, es6, mocha */
const path = require('path');
const assert = require('assert');
const sinon = require('sinon');
const intercept = require('intercept-stdout');
const inquirer = require('inquirer');
const chalk = require('chalk');
const md = require('../lib/md');
const todo = require('../lib/todo');
const cli = require('../lib/cli-functions');
const config = require('../lib/config.js');

context('cli-functions.js', () => {
  beforeEach(() => {
    this.project = new todo.Project('Title', 'Multiline\ndescription!');
    this.project.insertList(new todo.List('list1', 'description'));
    this.project.insertList(new todo.List('list2', ''));
    this.project.insertList(new todo.List('random', 'this is a sentence...'));
    this.project.getList(0).insertItem('todo **item**');
    this.project.getList(0).insertItem('done item', true);
    this.project.getList(2).insertItem('this is done', true);
    this.project.getList(2).insertItem('this is not done');

    sinon.stub(md, 'readFile').resolves(this.project);
    sinon.stub(md, 'writeFile').resolves(this.project);
  });

  afterEach(() => {
    md.readFile.restore();
    md.writeFile.restore();
  });

  describe('#new', () => {
    afterEach(() => {
      inquirer.prompt.restore();
    });

    it('should create a new project', () => {
      sinon.stub(inquirer, 'prompt').resolves({title: 'title', desc: 'description\n'});
      return cli.newProject({file: 'test'})
        .then(() => {
          sinon.assert.calledOnce(md.writeFile);
          sinon.assert.calledWith(md.writeFile, 'test.md', sinon.match({title: 'title', desc: 'description'}));
        });
    });

    it('should not overwrite an existing file', () => {
      sinon.stub(inquirer, 'prompt').resolves({overwrite: false});
      return cli.newProject({argv: ['TODO.md']})
        .then(() => {
          sinon.assert.notCalled(md.writeFile);
        });
    });

    it('should create a global project when asked', () => {
      sinon.stub(inquirer, 'prompt').resolves({title: 'title', desc: 'description\n'});
      return cli.newProject({file: 'test', global: true})
        .then(() => {
          sinon.assert.calledOnce(md.writeFile);
          sinon.assert.calledWith(md.writeFile, process.env.HOME + '/.config/todocmd/test.md');
        });
    });
  });

  describe('#list', () => {
    it('should display all lists when called without arguments', () => {
      const log = [];
      const restore = intercept(txt => {
        log.push(txt);
        return '';
      });
      return cli.list({argv: []})
        .then(() => {
          restore();
          assert.deepEqual(log, [
            chalk.cyan('Title') + '\n',
            chalk.gray('Multiline\ndescription!') + '\n',
            chalk.cyan('  >> ') + 'list1\n',
            chalk.cyan('  >> ') + 'list2\n',
            chalk.cyan('  >> ') + 'random\n'
          ]);
        })
        .catch(err => {
          restore();
          return Promise.reject(err);
        });
    });

    it('should display the items from all matched lists when called with a regexp', () => {
      const log = [];
      const restore = intercept(txt => {
        log.push(txt);
        return '';
      });
      return cli.list({argv: ['l.*t']})
        .then(() => {
          restore();
          assert.deepEqual(log, [
            chalk.cyan('list1') + '\n',
            chalk.gray('description') + '\n',
            '  ' + chalk.red(config.symbols.nok) + ' todo ' + chalk.bold('item') + '\n',
            '  ' + chalk.green(config.symbols.ok) + ' done item\n',
            '\n',
            chalk.cyan('list2') + '\n',
            '\n'
          ]);
        })
        .catch(err => {
          restore();
          return Promise.reject(err);
        });
    });

    it('should allow the user to select a list and display it\'s items in interactive mode', () => {
      const log = [];
      const restore = intercept(txt => {
        log.push(txt);
        return '';
      });
      const stub = sinon.stub(inquirer, 'prompt').resolves({listindices: 2});
      return cli.list({interactive: true, argv: []})
        .then(() => {
          restore();
          stub.restore();
          sinon.assert.calledWith(md.readFile, path.join(process.cwd(), 'TODO.md'));
          assert.deepEqual(log, [
            chalk.gray('this is a sentence...') + '\n',
            '  ' + chalk.green(config.symbols.ok) + ' this is done\n',
            '  ' + chalk.red(config.symbols.nok) + ' this is not done\n'
          ]);
        })
        .catch(err => {
          restore();
          stub.restore();
          return Promise.reject(err);
        });
    });
  });

  describe('#listAdd', () => {
    afterEach(() => {
      inquirer.prompt.restore();
    });

    it('should add a list', () => {
      sinon.stub(inquirer, 'prompt').resolves({title: 'listTitle', desc: 'description\n'});
      return cli.listAdd({argv: []})
        .then(project => {
          sinon.assert.calledOnce(md.writeFile);
          assert.equal(project.getList(project.length - 1).title, 'listTitle');
          assert.equal(project.getList(project.length - 1).desc, 'description');
        });
    });

    it('should add a list at the specified index', () => {
      sinon.stub(inquirer, 'prompt').resolves({title: 'listTitle', desc: 'description\n'});
      return cli.listAdd({number: 1, argv: []})
        .then(project => {
          sinon.assert.calledOnce(md.writeFile);
          assert.equal(project.getList(0).title, 'listTitle');
          assert.equal(project.getList(0).desc, 'description');
        });
    });
  });

  describe('#listRm', () => {
    afterEach(() => {
      inquirer.prompt.restore();
    });

    it('should remove a list', () => {
      sinon.stub(inquirer, 'prompt').resolves({listindices: [1]});
      return cli.listRm({argv: []})
        .then(project => {
          sinon.assert.calledOnce(md.writeFile);
          assert.equal(project.length, 2);
          assert.equal(project.findLists('list2'), 0);
        });
    });

    it('should ask if a list is not empty', () => {
      sinon.stub(inquirer, 'prompt').resolves({delete: true});
      return cli.listRm({argv: ['description']})
        .then(project => {
          sinon.assert.calledOnce(md.writeFile);
          sinon.assert.calledOnce(inquirer.prompt);
          assert.equal(project.length, 2);
          assert.deepEqual(project.findLists('description'), []);
        });
    });

    it('should allow the user to pick if the regex matches multiple lists', () => {
      sinon.stub(inquirer, 'prompt')
        .onCall(0).resolves({listindices: [0]})
        .onCall(1).resolves({delete: true});
      return cli.listRm({argv: ['list']})
        .then(project => {
          sinon.assert.calledOnce(md.writeFile);
          assert.equal(project.length, 2);
          assert.equal(project.findLists('description'), 0);
        });
    });
  });

  describe('#itemAdd', () => {
    afterEach(() => {
      inquirer.prompt.restore();
    });

    it('should add an item', () => {
      sinon.stub(inquirer, 'prompt').resolves({value: 'this is an item'});
      return cli.itemAdd({list: 'random', argv: []})
        .then(project => {
          sinon.assert.calledOnce(md.writeFile);
          assert.equal(project.getList(2).getItem(2).value, 'this is an item');
          assert.equal(project.getList(2).getItem(2).done, false);
        });
    });

    it('should add an item at the specified index', () => {
      sinon.stub(inquirer, 'prompt').resolves({value: 'this is an item'});
      return cli.itemAdd({list: 'random', number: 1, argv: []})
        .then(project => {
          sinon.assert.calledOnce(md.writeFile);
          assert.equal(project.getList(2).getItem(0).value, 'this is an item');
          assert.equal(project.getList(2).getItem(0).done, false);
        });
    });

    it('should ask for a list if none is provided', () => {
      sinon.stub(inquirer, 'prompt')
        .onCall(0).resolves({listindices: 2})
        .onCall(1).resolves({value: 'todo item'});
      return cli.itemAdd({argv: []})
        .then(project => {
          assert.equal(project.getList(2).getItem(2).value, 'todo item');
          assert.equal(project.getList(2).getItem(2).done, false);
        });
    });
  });

  describe('#itemRm', () => {
    afterEach(() => {
      if (inquirer.prompt.restore) {
        inquirer.prompt.restore();
      }
    });

    it('should remove an item', () => {
      return cli.itemRm({list: 'random', argv: ['not']})
        .then(project => {
          sinon.assert.calledOnce(md.writeFile);
          assert.equal(project.getList(2).length, 1);
          assert.equal(project.getList(2).getItem(0).done, true);
        });
    });

    it('should let the user choose if there are multiple matches', () => {
      sinon.stub(inquirer, 'prompt').resolves({items: {list: this.project.getList(2), index: 0}});
      return cli.itemRm({argv: []})
        .then(project => {
          assert.equal(project.getList(2).getItem(0).value, 'this is not done');
          assert.equal(project.getList(2).getItem(0).done, false);
        });
    });
  });

  describe('#itemMark', () => {
    afterEach(() => {
      if (inquirer.prompt.restore) {
        inquirer.prompt.restore();
      }
    });

    it('should mark an item as (un)checked', () => {
      sinon.stub(inquirer, 'prompt').resolves({items: {list: this.project.getList(2), index: 1}});
      return cli.itemMark(true, {list: 'random', argv: ['this']})
        .then(project => {
          sinon.assert.calledOnce(md.writeFile);
          assert.equal(project.getList(2).getItem(1).done, true);
        });
    });

    it('should mark all matched items, when the all flag is used', () => {
      return cli.itemMark(false, {all: true, argv: ['done']})
        .then(project => {
          assert.equal(project.getList(0).getItem(1).done, false);
          assert.equal(project.getList(2).getItem(1).done, false);
        });
    });
  });
});
