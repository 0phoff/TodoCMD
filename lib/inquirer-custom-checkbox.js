/**
 * `specialCheckbox` type prompt
 */

const util = require('util');
const chalk = require('chalk');
const _ = require('../node_modules/lodash');
const cliCursor = require('../node_modules/cli-cursor');
const figures = require('../node_modules/figures');
const Base = require('../node_modules/inquirer/lib/prompts/base');
const observe = require('../node_modules/inquirer/lib/utils/events');
const Paginator = require('../node_modules/inquirer/lib/utils/paginator');

/**
 * Module exports
 */

module.exports = Prompt;

/**
 * Constructor
 */

function Prompt() {
  Base.apply(this, arguments);

  if (!this.opt.choices) {
    this.throwParamError('choices');
  }

  if (_.isArray(this.opt.default)) {
    this.opt.choices.forEach(function (choice) {
      if (this.opt.default.indexOf(choice.value) >= 0) {
        choice.checked = true;
      }
    }, this);
  }

  this.pointer = 0;
  this.firstRender = true;

  // Make sure no default is set (so it won't be printed)
  this.opt.default = null;

  this.paginator = new Paginator();
}
util.inherits(Prompt, Base);

/**
 * Start the Inquiry session
 * @param  {Function} cb      Callback when prompt is done
 * @return {this}
 */

Prompt.prototype._run = function (cb) {
  this.done = cb;

  const events = observe(this.rl);

  const validation = this.handleSubmitEvents(
    events.line.map(this.getCurrentValue.bind(this))
  );
  validation.success.forEach(this.onEnd.bind(this));
  validation.error.forEach(this.onError.bind(this));

  events.normalizedUpKey.takeUntil(validation.success).forEach(this.onUpKey.bind(this));
  events.normalizedDownKey.takeUntil(validation.success).forEach(this.onDownKey.bind(this));
  events.numberKey.takeUntil(validation.success).forEach(this.onNumberKey.bind(this));
  events.spaceKey.takeUntil(validation.success).forEach(this.onSpaceKey.bind(this));
  events.aKey.takeUntil(validation.success).forEach(this.onAllKey.bind(this));
  events.iKey.takeUntil(validation.success).forEach(this.onInverseKey.bind(this));

  // Init the prompt
  cliCursor.hide();
  this.render();
  this.firstRender = false;

  return this;
};

/**
 * Render the prompt to screen
 * @return {Prompt} self
 */

Prompt.prototype.render = function (error) {
  // Render question
  let message = this.getQuestion();
  let bottomContent = '';

  if (this.firstRender) {
    message += '(Press ' + chalk.cyan.bold('<space>') + ' to select, ' + chalk.cyan.bold('<a>') + ' to toggle all, ' + chalk.cyan.bold('<i>') + ' to inverse selection)';
  }

  // Render choices or answer depending on the state
  if (this.status === 'answered') {
    message += chalk.cyan(this.selection.join(', '));
  }
  else {
    const choicesStr = renderChoices(this.opt.choices, this.pointer);
    const indexPosition = this.opt.choices.indexOf(this.opt.choices.getChoice(this.pointer));
    message += '\n' + this.paginator.paginate(choicesStr, indexPosition, this.opt.pageSize);
  }

  if (error) {
    bottomContent = chalk.red('>> ') + error;
  }

  this.screen.render(message, bottomContent);
};

/**
 * When user press `enter` key
 */

Prompt.prototype.onEnd = function (state) {
  this.status = 'answered';

  // Rerender prompt (and clean subline error)
  this.render();

  this.screen.done();
  cliCursor.show();
  this.done(state.value);
};

Prompt.prototype.onError = function (state) {
  this.render(state.isValid);
};

Prompt.prototype.getCurrentValue = function () {
  const choices = this.opt.choices.filter(choice => {
    return Boolean(choice.checked) && !choice.disabled;
  });

  this.selection = _.map(choices, 'short');
  return _.map(choices, 'value');
};

Prompt.prototype.onUpKey = function () {
  const len = this.opt.choices.realLength;
  this.pointer = (this.pointer > 0) ? this.pointer - 1 : len - 1;
  this.render();
};

Prompt.prototype.onDownKey = function () {
  const len = this.opt.choices.realLength;
  this.pointer = (this.pointer < len - 1) ? this.pointer + 1 : 0;
  this.render();
};

Prompt.prototype.onNumberKey = function (input) {
  if (input <= this.opt.choices.realLength) {
    this.pointer = input - 1;
    this.toggleChoice(this.pointer);
  }
  this.render();
};

Prompt.prototype.onSpaceKey = function () {
  this.toggleChoice(this.pointer);
  this.render();
};

Prompt.prototype.onAllKey = function () {
  const shouldBeChecked = Boolean(this.opt.choices.find(choice => {
    return choice.type !== 'separator' && !choice.checked;
  }));

  this.opt.choices.forEach(choice => {
    if (choice.type !== 'separator') {
      choice.checked = shouldBeChecked;
    }
  });

  this.render();
};

Prompt.prototype.onInverseKey = function () {
  this.opt.choices.forEach(choice => {
    if (choice.type !== 'separator') {
      choice.checked = !choice.checked;
    }
  });

  this.render();
};

Prompt.prototype.toggleChoice = function (index) {
  const item = this.opt.choices.getChoice(index);
  if (item !== undefined) {
    this.opt.choices.getChoice(index).checked = !item.checked;
  }
};

/**
 * Function for rendering checkbox choices
 * @param  {Number} pointer Position of the pointer
 * @return {String}         Rendered content
 */

function renderChoices(choices, pointer) {
  let output = '';
  let separatorOffset = 0;

  choices.forEach((choice, i) => {
    if (choice.type === 'separator') {
      separatorOffset++;
      output += ' ' + choice + '\n';
      return;
    }

    if (choice.disabled) {
      separatorOffset++;
      output += '  -  ' + choice.name;
    }
    else {
      const isSelected = (i - separatorOffset === pointer);
      output += isSelected ? chalk.cyan(figures.pointer + ' ') : '  ';
      output += getCheckbox(choice.checked) + '  ' + choice.name;
    }

    output += '\n';
  });

  return output.replace(/\n$/, '');
}

/**
 * Get the checkbox
 * @param  {Boolean} checked - add a X or not to the checkbox
 * @return {String} Composited checkbox string
 */

function getCheckbox(checked) {
  return checked ? chalk.green(figures.radioOn) : figures.radioOff;
}
