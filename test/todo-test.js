/* eslint-env node, es6, mocha */
const assert = require('assert');
const todo = require('../lib/todo');

context('todo.js', () => {
  describe('Class List', () => {
    beforeEach(() => {
      this.list = new todo.List('rad\n#title!', '###sanitizing\n\nis really nice\n  - 1\n* 2');
    });

    describe('#ctor', () => {
      it('should return a valid & sanitized object', () => {
        assert.equal(this.list.title, 'rad #title!');
        assert.equal(this.list.desc, 'sanitizing\nis really nice\n 1\n 2');
        assert.equal(this.list.length, 0);
        assert.equal(this.list.done, 0);
        assert.deepEqual(this.list._content, []);
      });
    });

    describe('#insertItem', () => {
      it('should insert an item object', () => {
        const item = {value: 'item', done: false};
        const index = this.list.insertItem('item');

        assert.equal(this.list.length, 1);
        assert.deepEqual(this.list.getItem(index), item);

        this.list.insertItem(123, true, 0);
        assert.deepEqual(this.list.getItem(0), {value: '123', done: true});
        assert.equal(this.list.getItem(1).value, 'item');
      });
    });

    describe('#removeItem', () => {
      it('should remove item objects', () => {
        this.list.insertItem('item0');
        this.list.insertItem('item1');
        this.list.insertItem('item2');

        this.list.removeItem(1);
        assert.equal(this.list.length, 2);
        this.list.removeItem(1);
        assert.equal(this.list.length, 1);
        assert.equal(this.list.getItem(0).value, 'item0');
        this.list.removeItem(0);
        assert.equal(this.list.length, 0);
      });
    });

    describe('#changeItem', () => {
      it('should change the right object', () => {
        this.list.insertItem('item1');
        this.list.insertItem('item2');
        this.list.changeItem(0, 'item0');

        assert.deepEqual(this.list.getItem(0), {value: 'item0', done: false});
        assert.deepEqual(this.list.getItem(1), {value: 'item2', done: false});
      });
    });

    describe('#swapItems', () => {
      it('should swap 2 items', () => {
        this.list.insertItem('item0');
        this.list.insertItem('item1');
        this.list.swapItems(0, 1);

        assert.equal(this.list.getItem(0).value, 'item1');
        assert.equal(this.list.getItem(1).value, 'item0');
      });
    });

    describe('#markItem', () => {
      it('should mark an item as done', () => {
        this.list.insertItem('item');
        this.list.markItem(0, true);

        assert(this.list.getItem(0).done);
      });

      it('should mark an item as todo', () => {
        this.list.insertItem('item', true);
        this.list.markItem(0, false);

        assert(!this.list.getItem(0).done);
      });
    });

    describe('#toggleItem', () => {
      it('should toggle the state of an item', () => {
        this.list.insertItem('item0');
        this.list.insertItem('item1');
        this.list.markItem(1, true);

        this.list.toggleItem(0);
        assert(this.list.getItem(0).done);
        this.list.toggleItem(1);
        assert(!this.list.getItem(1).done);
      });
    });

    describe('#findItems', () => {
      it('should return an array of matched items', () => {
        this.list.insertItem('it is beautiful');
        this.list.insertItem('item1');
        this.list.insertItem('no bueno');
        this.list.insertItem('the beacons are lit!');

        assert.deepEqual(this.list.findItems('it'), [0, 1, 3]);
      });

      it('should be smart-case sensitive', () => {
        this.list.insertItem('item');
        this.list.insertItem('Italiano');

        assert.deepEqual(this.list.findItems('it'), [0, 1]);
        assert.deepEqual(this.list.findItems('It'), [1]);
      });

      it('should accept regular expresions', () => {
        this.list.insertItem('Italiano');
        this.list.insertItem('The beacons are lit! Are not?');

        assert.deepEqual(this.list.findItems('it.*no'), [0, 1]);
      });
    });
  });

  describe('Class Project', () => {
    beforeEach(() => {
      this.project = new todo.Project(' #title', 'description\nmultiline!');
    });

    describe('#ctor', () => {
      it('should return a valid & sanitized object', () => {
        assert.equal(this.project.title, '#title');
        assert.equal(this.project.desc, 'description\nmultiline!');
        assert.equal(this.project.length, 0);
        assert.deepEqual(this.project._content, []);
      });
    });

    describe('#insertList', () => {
      it('should insert a list object', () => {
        const list0 = new todo.List('todolist0', 'desc');
        const list1 = new todo.List('todolist1', 'desc');

        this.project.insertList(list0);
        assert.equal(this.project.getList(0).title, 'todolist0');

        this.project.insertList(list1, 0);
        assert.equal(this.project.getList(0).title, 'todolist1');
        assert.equal(this.project.getList(1).title, 'todolist0');
      });
    });

    describe('#removeList', () => {
      it('should remove list objects', () => {
        this.project.insertList(new todo.List('todolist0', 'desc'));
        this.project.insertList(new todo.List('todolist1', 'desc'));
        this.project.insertList(new todo.List('todolist2', 'desc'));

        this.project.removeList(1);
        assert.equal(this.project.length, 2);
        this.project.removeList(0);
        assert.equal(this.project.length, 1);
        assert.equal(this.project.getList(0).title, 'todolist2');
        this.project.removeList(0);
        assert.equal(this.project.length, 0);
      });
    });

    describe('#swapLists', () => {
      it('should swap 2 list objects', () => {
        this.project.insertList(new todo.List('todolist0', 'desc'));
        this.project.insertList(new todo.List('todolist1', 'desc'));
        this.project.swapLists(0, 1);

        assert.equal(this.project.getList(0).title, 'todolist1');
        assert.equal(this.project.getList(1).title, 'todolist0');
      });
    });

    describe('#findLists', () => {
      it('should return an array of matched items', () => {
        this.project.insertList(new todo.List('todo0', 'description of the list'));
        this.project.insertList(new todo.List('list1', 'desc'));
        this.project.insertList(new todo.List('todolist2', 'desc'));

        assert.deepEqual(this.project.findLists('list'), [1, 2]);
        assert.deepEqual(this.project.findLists('list', true), [0, 1, 2]);
        assert.deepEqual(this.project.findLists('todo'), [0, 2]);
      });

      it('should be smart-case sensitive', () => {
        this.project.insertList(new todo.List('todo0', 'description of the LIST'));
        this.project.insertList(new todo.List('list1', 'desc'));

        assert.deepEqual(this.project.findLists('list', true), [0, 1]);
        assert.deepEqual(this.project.findLists('LIST', true), [0]);
      });

      it('should accept regular expresions', () => {
        this.project.insertList(new todo.List('todo0', 'description of list number 1 (actually 0)'));
        this.project.insertList(new todo.List('list1', 'desc'));

        assert.deepEqual(this.project.findLists('list.*1', true), [0, 1]);
      });
    });
  });
});
