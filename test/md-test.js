/* eslint-env node, es6, mocha */
const assert = require('assert');
const fs = require('fs');
const md = require('../lib/md');
const todo = require('../lib/todo');

context('md.js', () => {
  describe('#readFile', () => {
    it('should return a promise', () => {
      const p = md.readFile('file');
      assert(p instanceof Promise);
      return p.catch(err => Promise.resolve(err));
    });

    it('should reject the promise with a non-existent filename', () => {
      const p = md.readFile('doesnotexist');
      return p.then(succes => Promise.reject(succes), err => Promise.resolve(err));
    });

    it('shoud reject the promise with a file that has a syntax error', () => {
      fs.writeFileSync('invalid.md', '#invalid\nproject desc\n\n#NoH2\nlist desc\n  - [ ] item');
      const p = md.readFile('invalid.md');
      return p.then(succes => Promise.reject(succes), err => Promise.resolve(err));
    });

    it('should resolve the promise with a valid file', () => {
      fs.writeFileSync('valid.md', '#valid\nproject desc\n\n## H2\n  - [ ] item\n- [X] item\n');
      const p = md.readFile('valid.md');

      return p
        .then(data => {
          assert(data instanceof todo.Project);
          assert.equal(data.getList(0).desc, '');
          return Promise.resolve();
        }, err => Promise.reject(err));
    });

    after(() => {
      try {
        fs.unlinkSync('invalid.md');
        fs.unlinkSync('valid.md');
      }
      catch (err) {}
    });
  });

  describe('#writeFile', () => {
    it('should return a promise', () => {
      const p = md.writeFile('file', {});
      assert(p instanceof Promise);
      return p.catch(err => Promise.resolve(err));
    });

    it('should reject the promise with an invalid object', () => {
      const p = md.writeFile('file', {});
      return p.then(succes => Promise.reject(succes), err => Promise.resolve(err));
    });

    it('should resolve the promise with a valid object', () => {
      const todoObj = new todo.Project('title', 'description');
      todoObj.insertList(new todo.List('list1', 'description'));
      todoObj.getList(0).insertItem('todo item');
      todoObj.getList(0).insertItem('done item', true);
      const p = md.writeFile('file.md', todoObj);

      return p
        .then(() => {
          const file = fs.readFileSync('file.md', 'utf8');
          fs.unlinkSync('file.md');
          assert.equal(file, '# title\ndescription\n\n## list1\ndescription\n  - [ ] todo item\n  - [X] done item\n\n');
          return Promise.resolve();
        });
    });
  });
});
