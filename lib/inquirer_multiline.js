/**
 * `input` type prompt
 */

const util = require('util');
const chalk = require('chalk');
const Base = require('../node_modules/inquirer/lib/prompts/base');
const observe = require('../node_modules/inquirer/lib/utils/events');

/**
 * Module exports
 */

module.exports = Prompt;

/**
 * Constructor
 */

function Prompt() {
  Base.apply(this, arguments);

  this.text = [];
  this.firstRender = true;
}
util.inherits(Prompt, Base);

/**
 * Start the Inquiry session
 * @param  {Function} cb      Callback when prompt is done
 * @return {this}
 */

Prompt.prototype._run = function (cb) {
  this.done = cb;

  // Once user confirm (enter key)
  var events = observe(this.rl);
  var submit = events.line
    .filter(this.getLines.bind(this))
    .map(this.filterInput.bind(this));

  var validation = this.handleSubmitEvents(submit);
  validation.success.forEach(this.onEnd.bind(this));
  validation.error.forEach(this.onError.bind(this));

  events.keypress.takeUntil(validation.success).forEach(this.onKeypress.bind(this));

  // Init
  this.render();
  this.firstRender = false;

  return this;
};

/**
 * Render the prompt to screen
 * @return {Prompt} self
 */

Prompt.prototype.render = function (error) {
  var bottomContent = '';
  var message = this.getQuestion();

  if (this.firstRender) {
    message += '(Press ' + chalk.cyan.bold('<enter>') + ' twice to complete input)\n';
  }
  else {
    message += '\n';
  }

  if (this.status === 'answered') {
    message += chalk.cyan(this.answer);
  }
  else {
    message += this.text.join('\n');
    message += '\n' + this.rl.line;
  }

  if (error) {
    bottomContent = chalk.red('>> ') + error;
  }

  this.screen.render(message, bottomContent);
};

/**
 * When user press `enter` key
 */

Prompt.prototype.filterInput = function () {
  if (this.text.length === 0) {
    return this.opt.default === null ? '' : this.opt.default;
  }
  return this.text.join('\n');
};

Prompt.prototype.getLines = function (input) {
  if (input) {
    this.text.push(input);
    return false;
  }
  return true;
};

Prompt.prototype.onEnd = function (state) {
  this.answer = state.value;
  this.status = 'answered';

  // Re-render prompt
  this.render();

  this.screen.done();
  this.done(state.value);
};

Prompt.prototype.onError = function (state) {
  this.render(state.isValid);
};

/**
 * When user press a key
 */

Prompt.prototype.onKeypress = function (e) {
  if (e.key.name === 'backspace' && !this.rl.line) {
    this.rl.line = this.text.pop() || '';
    this.rl.cursor = this.rl.line.length;
  }
  this.render();
};
