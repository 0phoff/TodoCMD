'use strict';

/*
 * PUBLIC API
 */
class Base
{
  constructor(title, desc)
  {
    if (title)
      this._title = sanitizeTitle(title);
    else
      this._title = '';

    if (desc)
      this._desc = sanitizeDesc(desc);
    else
      this._desc = '';

    this._content = [];
  }

  get title() { return this._title; }
  set title(newTitle) { this._title = sanitizeTitle(newTitle); }

  get desc() { return this._desc; }
  set desc(newDesc) { this._desc = sanitizeDesc(newDesc); }

  get length() { return this._content.length; }

  insert(obj, index)
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

  remove(index)
  {
    if (index < 0 || index > this._content.length)
      return null;

    return this._content.splice(index, 1);
  }

  swap(index1, index2)
  {
    if (index1 < 0 || index2 < 0 || index1 >= this.length || index2 >= this.length)
      return null;

    let tempItem = this._content[index1];
    this._content[index1] = this._content[index2];
    this._content[index2] = tempItem;
    return true;
  }
}

class List extends Base
{
  constructor(title, desc)
  {
    super(title, desc);
  }

  get done()
  {
    let done = 0;
    this._content.forEach(item => {
      if (item.done)
        ++done;
    });
    return done;
  }

  getItem(index) { return this._content[index]; }

  insertItem(value, state, index)
  {
    value = ''+value;

    if (typeof index != 'number' || isNaN(index))
      index = this.length;
    let insertedIndex = super.insert({value, done: false}, index);

    if (state)
      this.markItem(insertedIndex, state);

    return insertedIndex;
  }

  removeItem(index)
  {
    return super.remove(index);
  }

  changeItem(index, value)
  {
    if (index < 0 || index >= this.length)
      return null;

    value = ''+value;
    this._content[index].value = value;
    return value;
  }

  markItem(index, state)
  {
    if (index < 0 || index >= this.length)
      return null;

    let done = state ? true:false;
    this._content[index].done = done;
    return true;
  }

  toggleItem(index)
  {
    if (index < 0 || index >= this.length)
      return null;

    let done = !this._content[index].done;
    this._content[index].done = done;
    return done;
  }

  swapItems(index1, index2)
  {
    return super.swap(index1, index2);
  }

  findItems(search)
  {
    let flags = /[A-Z]/.test(search) ? '':'i';
    let re = new RegExp(search, flags);

    return this._content.reduce((acc, cur, i) => {
      if (re.test(cur.value))
        acc.push(i);
      return acc;
    }, []);
  }
}

class Project extends Base
{
  constructor(title, desc)
  {
    super(title, desc);
  }

  getList(index) { return this._content[index]; }

  insertList(list, index)
  {
    if (!list instanceof List)
      return null;

    if (typeof index != 'number' || isNaN(index))
      index = this.length;

    return super.insert(list, index);
  }

  removeList(index)
  {
    return super.remove(index);
  }

  swapLists(index1, index2)
  {
    return super.swap(index1, index2);
  }

  findLists(search, desc)
  {
    let flags = /[A-Z]/.test(search) ? '':'i';
    let re = new RegExp(search, flags);

    return this._content.reduce((acc, cur, i) => {
      if (re.test(cur.title) || (desc && re.test(cur.desc)))
        acc.push(i);
      return acc;
    }, []);
  }
}

/*
 * PRIVATE FUNCTIONS
 */
function sanitizeTitle(title)
{
  if (!title)
    return '';
  return title.replace('\n', ' ').replace(/^\s+/, '');
}

function sanitizeDesc(desc)
{
  if (!desc)
    return '';

  return desc.split('\n').reduce((acc, cur) => {
    if (/^\s*$/.test(cur))
      return acc;

    function sanitize(string)
    {
      let san = string.replace(/^\s*#+/, '');   // Strip leading #
      san = san.replace(/^\s*[-*]+/, '');       // Strip leading - or *

      if (san == string)
        return san;             // Fully sanitized
      else
        return sanitize(san);   // Sanitize again
    }
    cur = sanitize(cur);

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
