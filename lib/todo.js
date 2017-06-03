'use strict';

/*
 * PUBLIC API
 */
class Base
{
  constructor(title, desc)
  {
    this._title = sanitizeTitle(title);
    this._desc = sanitizeDesc(desc);
    this._content = [];
  }

  get title() { return this._title; }
  set title(newTitle) { this._title = sanitizeTitle(newTitle); }

  get desc() { return this._desc; }
  set desc(newDesc) { this._desc = sanitizeDesc(newDesc); }

  get length() { return this._content.length; }

  insert(index, obj)
  {
    if (index >= this._content.length)
    {
      this._content.push(obj);
      return this._content.length-1;
    }

    if (index <= 0)
    {
      this._content.unshift(obj);
      return 0;
    }
    
    this._content.splice(index, 0, obj);
    return index;
  }
}

class List extends Base
{
  constructor(title, desc)
  {
    super(title, desc);
    this._done = 0;
  }

  get done() { return this._done; }

  getItem(index) { return this._content[index]; }

  addItem(index, value)
  {
    value = ''+value;
    return super.insert(index, {value, done: false});
  }

  changeItem(index, value)
  {
    if (index < 0 || index >= this.length)
      return null;

    value = ''+value;
    this._content[index].value = value;
    return value;
  }

  checkItem(index)
  {
    if (index < 0 || index >= this.length)
      return null;

    this._content[index].done = true;
    return true;
  }

  uncheckItem(index)
  {
    if (index < 0 || index >= this.length)
      return null;

    this._content[index].done = false;
    return false;
  }

  toggleItem(index)
  {
    if (index < 0 || index >= this.length)
      return null;

    let done = !this._content[index].done;
    this._content[index].done = done;
    return done;
  }
}

class Project extends Base
{
  constructor(title, desc)
  {
    super(title, desc);
  }
}

/*
 * PRIVATE FUNCTIONS
 */
function sanitizeTitle(title)
{
  return title.replace('\n', ' ').replace(/^\S/, ' $&');
}

function sanitizeDesc(desc)
{
  return desc.split('\n').reduce((acc, cur) => {
    if (!cur.length)
      return acc;

    if (cur.search(/^\s*[-*]/) != -1)
      return acc;

    cur = cur.replace(/^#+/, '');   // Strip leading #
    if (!acc.length)
      return cur;
    else
      return acc.concat('\n'+cur);
  }, '');
}

/*
 * MODULE EXPORTS
 */
module.exports = {
  List,
  Project
};
