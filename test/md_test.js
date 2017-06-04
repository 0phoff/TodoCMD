const assert = require('assert');
const fs = require('fs');
// TODO: const common = require('./common');
const md = require('../lib/md');
const todo = require('../lib/todo');

describe('md.js', function() {

  describe('#readFile', function() {
    it('should return a promise', function() {
      let p = md.readFile('file');
      assert(p instanceof Promise);
    });

    it('should reject the promise with a non-existent filename', function() {
      let p = md.readFile('doesnotexist');
      return p.then(succes => Promise.reject(succes), err => Promise.resolve(err));
    });

    it('shoud reject the promise with a file that has a syntax error', function() {
      fs.writeFileSync('invalid.md','#title\ndescription\n\n#NoH2\ndescription\n  - [ ] item');
      let p = md.readFile('invalid.md');
      return p
        .then(success => {
          fs.unlinkSync('invalid.md');
          return Promise.reject(success);
        }, err => {
          fs.unlinkSync('invalid.md');
          return Promise.resolve();
        });
    });

    it('should resolve the promise with a valid file', function() {
      fs.writeFileSync('valid.md', '#title\ndescription\n\n## H2 here\ndescription\n  - [ ] item\n- [X] item\n');
      let p = md.readFile('valid.md');

      return p
        .then(data => {
          fs.unlinkSync('valid.md');
          assert(data instanceof todo.Project);
          return Promise.resolve();
        }, err => {
          fs.unlinkSync('valid.md');
          return Promise.reject(err);
        });
    });

    after(function() {
      try
      {
        fs.unlinkSync('invalid.md');
        fs.unlinkSync('valid.md');
      }
      catch(e) {}
    });
  });

  describe('#writeFile', function() {
    it('should return a promise', function() {
      let p = md.writeFile('file', {});
      assert(p instanceof Promise);
    });
    
    it('should reject the promise with an invalid object', function() {
      let p = md.writeFile('file', {});
      return p.then(succes => Promise.reject(succes), err => Promise.resolve(err));
    });

    it('should resolve the promise with a valid object', function() {
      let todoObj = new todo.Project('title', 'description');
      let p = md.writeFile('file', todoObj);

      return p
        .then(filename => {
          let file = fs.readFileSync(filename, 'utf8');
          assert.equal(file, '# title\ndescription');
          fs.unlinkSync(filename);
          return Promise.resolve();
        });
    });
  });

});
