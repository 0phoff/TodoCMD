'use strict';
const stream = require('stream');
const todo = require('./todo');

/*
 * PUBLIC API
 */
class SplitParagraphs extends stream.Transform
{
  constructor()
  {
    super();

    this._buffer = '';
  }

  _transform(chunk, _, cb)
  {
    let array = (this._buffer + chunk.toString()).split('\n\n');

    while (array.length > 1)
    {
      let paragraph = array.shift();
      this.push(paragraph);
    }

    this._buffer = array[0];
    cb();
  }

  _flush(cb)
  {
    if (/^\s*$/.test(this._buffer))
      cb();
    else
    {
      this.push(this._buffer.replace(/\n+$/, ''));
      cb();
    }
  }
}

class Deserialize extends stream.Writable
{
  constructor(project)
  {
    super();
    
    if (!(project instanceof todo.Project))
      throw new Error('Expecting object of type todo.Project');

    this._project = project;
    this._state = 0;
  }

  _write(chunk, _, cb)
  {
    if (!this._state)
    {
      try
      {
        let [title, desc] = chunk.toString().split(/\n((.|\n)+)/);
        this._project.title = deserializeTitle(title, 1);
        this._project.desc = desc;

        ++this._state;
        cb();
      }
      catch (e)
      {
        cb(e);
      }
    }
    else
    {
      try
      {
        let [title, rest] = chunk.toString().split(/\n((.|\n)+)/);
        let [desc, items] = deserializeParagraph(rest);

        let list = new todo.List(deserializeTitle(title, 2), desc ? desc:'');
        deserializeItems(list, items);
        this._project.insertList(list);

        cb();
      }
      catch (e)
      {
        cb(e);
      }
    }
  }
}


/*
 * PRIVATE FUNCTIONS
 */
function deserializeTitle(string, level)
{
  let re = new RegExp('^#{' + level + '}[^#]');
  if (!re.exec(string))
    throw new Error(`Expected an H${level} '${string}'`);

  return string.substring(level);
}

function deserializeParagraph(string)
{
  if (!string || !string.length)
    return [undefined, undefined];
  if (/^\s*[-*]/.test(string))
    return [undefined, string];
  else
    return string.split(/\n(\s*[-*](.|\n)*)/);
}

function deserializeItems(list, string)
{
  if (!string)
    return;

  string.split('\n').forEach(function(item) {
    let match = item.match(/^\s*[-*]\s*\[( |x)\](.*)/i);

    if (!match)
      throw new Error(`Invalid todo item '${item}'`);

    list.insertItem(match[2], (match[1]==' ' ? false:true));
  });
}


/*
 * MODULE EXPORTS
 */
module.exports = {
  SplitParagraphs,
  Deserialize,
};
