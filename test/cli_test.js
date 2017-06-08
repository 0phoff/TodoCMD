const assert = require('assert');
const sinon = require('sinon');
const intercept = require('intercept-stdout');
const inquirer = require('inquirer');
const chalk = require('chalk');
const md = require('../lib/md');
const todo = require('../lib/todo');
const cli = require('../lib/cli_functions');
const config = require('../lib/config.js');

context('cli_functions.js', function() {

  before(function() {
    let project = new todo.Project('Title', 'Multiline\ndescription!');
    project.insertList(new todo.List('list1', 'description'));
    project.insertList(new todo.List('list2', ''));
    project.insertList(new todo.List('random', 'this is a sentence...'));
    project.getList(0).insertItem('todo item');
    project.getList(0).insertItem('done item', true);
    project.getList(2).insertItem('this is done', true);
    project.getList(2).insertItem('this is not done');

    sinon.stub(md, "readFile").resolves(project);
    sinon.stub(md, "writeFile").resolves(project);
  });

  after(function() {
    md.readFile.restore();
    md.writeFile.restore();
  });

  afterEach(function() {
    md.writeFile.resetHistory();
    md.readFile.resetHistory();
  });

  describe('#new', function() {
    afterEach(function() {
      inquirer.prompt.restore();
    });

    it('should create a new project', function() {
      sinon.stub(inquirer, 'prompt').resolves({ title: 'title', desc: 'description\n' });
      return cli.newProject({file: 'test'})
        .then(function() {
          sinon.assert.calledOnce(md.writeFile);
          sinon.assert.calledWith(md.writeFile, 'test.md', sinon.match({title: 'title', desc: 'description'}));
        });
    });

    it('should not overwrite an existing file', function() {
      sinon.stub(inquirer, 'prompt').resolves({ overwrite: false });
      return cli.newProject({argv: ['TODO.md']})
        .then(function() {
          sinon.assert.notCalled(md.writeFile);
        });
    });

    it('should create a global project when asked', function() {
      sinon.stub(inquirer, 'prompt').resolves({ title: 'title', desc: 'description\n' });
      return cli.newProject({file: 'test', global: true})
        .then(function() {
          sinon.assert.calledOnce(md.writeFile);
          sinon.assert.calledWith(md.writeFile, process.env.HOME + '/.config/todocmd/test.md');
        });
    });
  });

  describe('#list', function() {

    it('should display all lists when called without arguments', function() {
      let log = [];
      let restore = intercept(txt => {
        log.push(txt);
        return '';
      });
      return cli.list({argv: []})
        .then(function() {
          restore();
          assert.deepEqual(log, [
            chalk.cyan('Title')+'\n',
            chalk.dim('Multiline\ndescription!')+'\n',
            chalk.cyan('  >> ') + 'list1\n',
            chalk.cyan('  >> ') + 'list2\n',
            chalk.cyan('  >> ') + 'random\n'
          ]);
        })
        .catch(err => { restore(); return Promise.reject(err); });
    });

    it('should display the items from all matched lists when called with a regexp', function() {
      let log = [];
      let restore = intercept(txt => {
        log.push(txt);
        return '';
      });
      return cli.list({argv: ["l.*t"]})
        .then(function() {
          restore();
          assert.deepEqual(log, [
            chalk.cyan('list1')+'\n',
            chalk.dim('description')+'\n',
            '  '+chalk.red(config.symbols.nok)+' todo item\n',
            '  '+chalk.green(config.symbols.ok)+' done item\n',
            '\n',
            chalk.cyan('list2')+'\n',
            '\n'
          ]);
        })
        .catch(err => { restore(); return Promise.reject(err); });
    });

    it('should allow the user to select a list and display it\'s items in interactive mode', function() {
      let log = [];
      let restore = intercept(txt => {
        log.push(txt);
        return '';
      });
      let stub = sinon.stub(inquirer, 'prompt').resolves({'listindex': 2});
      return cli.list({interactive: true, argv: []})
        .then(function() {
          restore();
          sinon.assert.calledWith(md.readFile, 'TODO.md');
          assert.deepEqual(log, [
            chalk.dim('this is a sentence...')+'\n',
            '  '+chalk.green(config.symbols.ok)+' this is done\n',
            '  '+chalk.red(config.symbols.nok)+' this is not done\n',
          ]);
        })
        .catch(err => { restore(); return Promise.reject(err); });
    });
  });

  describe('#addlist', function() {
    afterEach(function() {
      inquirer.prompt.restore();
    });

    it('should add a list', function() {
      sinon.stub(inquirer, 'prompt').resolves({ title: 'listTitle', desc: 'description\n' });
      return cli.listAdd({argv: []})
        .then(function(project) {
          sinon.assert.calledOnce(md.writeFile);
          assert.equal(project.getList(project.length-1).title, 'listTitle');
          assert.equal(project.getList(project.length-1).desc, 'description');
        });
    });
  });

  describe.skip('#rmlist', function() {
    afterEach(function() {
      inquirer.prompt.restore();
    });

    it('should remove a list', function() {
      sinon.stub(inquirer, 'prompt').resolves({ listIndex: 1 });
      return cli.listAdd({argv: []})
        .then(function(project) {
          sinon.assert.calledOnce(md.writeFile);
          assert.equal(project.length, 2);
          assert.equal(project.findLists('list2'), 0);
        });
    });
    
    it('should ask if a list is not empty', function() {
      sinon.stub(inquirer, 'prompt').resolves({ confirm: true });
      return cli.listAdd({argv: ['description']})
        .then(function(project) {
          sinon.assert.calledOnce(md.writeFile);
          assert.equal(project.length, 2);
          assert.equal(project.findLists('description'), 0);
        });
    });

    it('should allow the user to pick if the regex matches multiple lists', function() {
      sinon.stub(inquirer, 'prompt')
        .onCall(0).resolves({ listIndex: [0] })
        .onCall(1).resolves({ confirm: true });
      return cli.listAdd({argv: ['list']})
        .then(function(project) {
          sinon.assert.calledOnce(md.writeFile);
          assert.equal(project.length, 2);
          assert.equal(project.findLists('description'), 0);
        });
    });
  });

});
