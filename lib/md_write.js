'use strict';
const stream = require('stream');
const todo = require('./todo');

/*
 * PUBLIC API
 */

class Writer extends stream.Readable
{
  constructor(object)
  {
    super('utf8');

    if (!(object instanceof todo.Project))
      throw new Error('Expecting object of type todo.Project');

    this._object = object;
    this._state = 0;
    this._listCount = 0;
    this._itemCount = 0;
    this._currentList = null;
  }

  _read()
  {
    if (this._state == 0)
    {
      this.push(serializeParagraph(this._object.title, this._object.desc) + '\n');
      ++this._state;
      return;
    }

    if (this._state == -1)
    {
      this.push(null);
      return;
    }

    switch(this._state)
    {
      case 1:
        this._sendParagraph();
        break;

      case 2:
        this._sendList();
        break;

      default:
        this.emit('error', new Error('Internal error'));
        break;
    }
  }

  _sendParagraph()
  {
    if (this._listCount >= this._object.length)
    {
      this._state = -1;
      this.push(null);
      return;
    }

    this._currentList = this._object.getList(this._listCount++);
    this._itemCount = 0;
    this.push('#' + serializeParagraph(this._currentList.title, this._currentList.desc));
    ++this._state;
  }

  _sendList()
  {
    if (this._currentList == null)
    {
      this.emit('error', new Error('Internal error'));
      return;
    }
    
    if (this._itemCount >= this._currentList.length)
    {
      this.push('\n')
      --this._state;
      return;
    }

    this.push(serializeListItem(this._currentList.getItem(this._itemCount++)));
  }
}

/*
 * PRIVATE FUNCTIONS
 */
function serializeParagraph(title, desc)
{
  return '# ' + title + '\n' + desc + '\n';
}

function serializeListItem(item)
{
  let status = item.done ? 'X':' ';
  return '  - [' + status + '] ' + item.value + '\n';
}

/*
 * MODULE EXPORTS
 */
module.exports = Writer;
