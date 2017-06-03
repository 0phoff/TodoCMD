const assert = require('assert');
const todo = require('../lib/todo');

describe('todo.js', function() {
  describe('List', function() {
    let list;
    beforeEach(function() {
      list = new todo.List('rad\n#title!', '###sanitizing\n\nis really nice\n  - 1\n* 2')
    });

    describe('#ctor', function() {
      it('should return a valid & sanitized object', function() {
        assert.equal(list.title, ' rad #title!');
        assert.equal(list.desc, 'sanitizing\nis really nice');
        assert.equal(list.length, 0);
        assert.equal(list.done, 0);
        assert.deepEqual(list._content, []);
      });
    });

    describe('#addItem', function() {
      it('should add item objects', function() {
        let item = {value: 'item', done: false};
        let index = list.addItem(list.length, 'item');

        assert.equal(list.length, 1);
        assert.deepEqual(list.getItem(index), item);

        list.addItem(0, 123, true);
        assert.deepEqual(list.getItem(0), { value: '123', done: true });
      });
    });

    describe('#changeItem', function() {
      it('should change the right object', function() {
        list.addItem(0, 'item1');
        list.addItem(1, 'item2');
        list.changeItem(0, 'item0');

        assert.deepEqual(list.getItem(0), {value:'item0', done:false});
        assert.deepEqual(list.getItem(1), {value:'item2', done:false});
      });
    });

    describe('#markItem', function() {
      it('should mark the item as done', function() {
        list.addItem(0, 'item1');
        list.addItem(1, 'item2', true);
        list.markItem(0, true);
        list.markItem(1, false);

        assert(list.getItem(0).done);
        assert(!list.getItem(1).done);
      });
    });

    describe('#toggleItem', function() {
      it('should toggle the state of an item', function() {
        list.addItem(0, 'item1');
        list.addItem(1, 'item2');
        list.markItem(1, true);

        list.toggleItem(0);
        assert(list.getItem(0).done);
        list.toggleItem(1);
        assert(!list.getItem(1).done);
      });
    });
  });

  describe('Project', function() {
    let project;
    beforeEach(function() {
      project = new todo.Project('rad\n#title!', '###sanitizing\n\nis really nice\n  - 1\n* 2');
    });

    describe('#ctor', function() {
      it('should return a valid & sanitized object', function() {
        assert.equal(project.title, ' rad #title!');
        assert.equal(project.desc, 'sanitizing\nis really nice');
        assert.equal(project.length, 0);
        assert.deepEqual(project._content, []);
      });
    });
  });
});
