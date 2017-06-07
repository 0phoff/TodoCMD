const assert = require('assert');
const sinon = require('sinon');
const stdout = require('test-console').stdout;
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

   });

  describe('#addlist', function() {
    
  });

  describe('#rmlist', function() {
    
  });

});
