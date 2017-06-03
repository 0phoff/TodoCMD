const assert = require('assert');
const todo = require('../lib/todo');

context('todo.js', function() {
  describe('Class List', function() {
    beforeEach(function() {
      this.list = new todo.List('rad\n#title!', '###sanitizing\n\nis really nice\n  - 1\n* 2')
    });

    describe('#ctor', function() {
      it('should return a valid & sanitized object', function() {
        assert.equal(this.list.title, ' rad #title!');
        assert.equal(this.list.desc, 'sanitizing\nis really nice');
        assert.equal(this.list.length, 0);
        assert.equal(this.list.done, 0);
        assert.deepEqual(this.list._content, []);
      });
    });

    describe('#insertItem', function() {
      it('should insert an item object', function() {
        let item = {value: 'item', done: false};
        let index = this.list.insertItem('item');

        assert.equal(this.list.length, 1);
        assert.deepEqual(this.list.getItem(index), item);

        this.list.insertItem(123, true, 0);
        assert.deepEqual(this.list.getItem(0), { value: '123', done: true });
        assert.equal(this.list.getItem(1).value, 'item');
      });
    });

    describe('#removeItem', function() {
      it('should remove item objects', function() {
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

    describe('#changeItem', function() {
      it('should change the right object', function() {
        this.list.insertItem('item1');
        this.list.insertItem('item2');
        this.list.changeItem(0, 'item0');

        assert.deepEqual(this.list.getItem(0), {value:'item0', done:false});
        assert.deepEqual(this.list.getItem(1), {value:'item2', done:false});
      });
    });

    describe('#swapItems', function() {
      it('should swap 2 items', function() {
        this.list.insertItem('item0');
        this.list.insertItem('item1');
        this.list.swapItems(0,1);

        assert.equal(this.list.getItem(0).value, 'item1');
        assert.equal(this.list.getItem(1).value, 'item0');
      })
    });

    describe('#markItem', function() {
      it('should mark an item as done', function() {
        this.list.insertItem('item');
        this.list.markItem(0, true);

        assert(this.list.getItem(0).done);
      });

      it('should mark an item as todo', function() {
        this.list.insertItem('item', true);
        this.list.markItem(0, false);

        assert(!this.list.getItem(0).done);
      });
    });

    describe('#toggleItem', function() {
      it('should toggle the state of an item', function() {
        this.list.insertItem('item0');
        this.list.insertItem('item1');
        this.list.markItem(1, true);

        this.list.toggleItem(0);
        assert(this.list.getItem(0).done);
        this.list.toggleItem(1);
        assert(!this.list.getItem(1).done);
      });
    });

    describe('#findItems', function() {
      it('should return an array of matched items', function() {
        this.list.insertItem('it is beautiful');
        this.list.insertItem('item1');
        this.list.insertItem('no bueno');
        this.list.insertItem('the beacons are lit!');

        assert.deepEqual(this.list.findItems('it'), [0,1,3]);
      });

      it('should be smart-case sensitive', function() {
        this.list.insertItem('item');
        this.list.insertItem('Italiano');

        assert.deepEqual(this.list.findItems('it'), [0,1])
        assert.deepEqual(this.list.findItems('It'), [1]);
      });

      it('should accept regular expresions', function() {
        this.list.insertItem('Italiano');
        this.list.insertItem('The beacons are lit! Are not?');
        
        assert.deepEqual(this.list.findItems('it.*no'), [0,1]);
      });
    });
  });

  describe('Class Project', function() {
    beforeEach(function() {
      this.project = new todo.Project(' #title', 'description\nmultiline!');
    });

    describe('#ctor', function() {
      it('should return a valid & sanitized object', function() {
        assert.equal(this.project.title, ' #title');
        assert.equal(this.project.desc, 'description\nmultiline!');
        assert.equal(this.project.length, 0);
        assert.deepEqual(this.project._content, []);
      });
    });

    describe('#insertList', function() {
      it('should insert a list object', function() {
        let list0 = new todo.List('todolist0', 'desc');
        let list1 = new todo.List('todolist1', 'desc');

        this.project.insertList(list0);
        assert.equal(this.project.getList(0).title, ' todolist0');

        this.project.insertList(list1, 0);
        assert.equal(this.project.getList(0).title, ' todolist1');
        assert.equal(this.project.getList(1).title, ' todolist0');
      });
    });

    describe('#removeList', function() {
      it('should remove list objects', function() {
        this.project.insertList(new todo.List('todolist0', 'desc')); 
        this.project.insertList(new todo.List('todolist1', 'desc')); 
        this.project.insertList(new todo.List('todolist2', 'desc')); 

        this.project.removeList(1);
        assert.equal(this.project.length, 2);
        this.project.removeList(0);
        assert.equal(this.project.length, 1);
        assert.equal(this.project.getList(0).title, ' todolist2');
        this.project.removeList(0);
        assert.equal(this.project.length, 0);
      });
    });

    describe('#swapLists', function() {
      it('should swap 2 list objects', function() {
        this.project.insertList(new todo.List('todolist0', 'desc')); 
        this.project.insertList(new todo.List('todolist1', 'desc')); 
        this.project.swapLists(0,1);

        assert.equal(this.project.getList(0).title, ' todolist1');
        assert.equal(this.project.getList(1).title, ' todolist0');
      });
    });
  });
});
