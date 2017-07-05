'use strict';
const path = require('path');
const chalk = require('chalk');

let options = null;
let version = null;
let globalDescription = null;
const globalFlags = [];

/*
 * PUBLIC
 */
class Command {
  constructor(name, parent) {
    this._name = name;
    this._alias = undefined;
    this._description = undefined;
    this._supercommand = parent;

    this._subcommands = [];
    this._flags = [];
    this._privateFlags = [];
    this._argument = null;
    this._action = null;
    this._unprocessed = null;

    this._help = true;
    this._helpColor = true;
    this._beforeHelp = null;
    this._afterHelp = null;
  }

  alias(string) {
    this._alias = String(string);
    return this;
  }

  description(desc) {
    this._description = String(desc);
    return this;
  }

  help(enabled, color, before, after) {
    this._help = enabled === true;
    this._helpColor = color === true;
    this._beforeHelp = before;
    this._afterHelp = after;
    return this;
  }

  flag(short, long, argument, desc) {
    short = String(short);
    long = String(long);
    desc = String(desc);

    this._flags.push({short: short[0], long, argument, desc});
    return this;
  }

  argument(name, required) {
    if (required) {
      this._argument = '<' + name + '>';
    }
    else {
      this._argument = '[' + name + ']';
    }

    return this;
  }

  command(name) {
    const sub = new Command(name, this);
    sub._help = this._help;
    sub._helpColor = this._helpColor;

    this._subcommands.push(sub);
    return sub;
  }

  action(fn) {
    this._action = fn;
    return this;
  }

  showHelp() {
    let color;
    if (this._helpColor) {
      color = new chalk.constructor();
    }
    else {
      color = new chalk.constructor({enabled: false});
    }

    if (typeof this._beforeHelp === 'function') {
      this._beforeHelp(options);
    }
    else if (this._help) {
      console.log(color.bold.cyan(`${options.commands[0]} ${options.version}`));
      console.log(`  ${options.globalDescription}`);
      console.log();
    }

    if (this._help) {
      const flags = [];
      let flagLength = 0;
      for (let i = options.globalFlags.length - 1; i >= 0; --i) {
        let length = options.globalFlags[i].long.length;

        if (options.globalFlags[i].argument) {
          length += 11;
        }
        if (length > flagLength) {
          flagLength = length;
        }

        flags.push(options.globalFlags[i]);
      }
      for (let i = this._flags.length - 1; i >= 0; --i) {
        let length = this._flags[i].long.length;

        if (this._flags[i].argument) {
          length += 11;
        }
        if (length > flagLength) {
          flagLength = length;
        }

        flags.push(this._flags[i]);
      }

      console.log(color.underline.cyan('Usage:'));
      if (this._action) {
        process.stdout.write('  ');
        options.commands.forEach(cmd => process.stdout.write(cmd + ' '));

        if (flags.length !== 0) {
          process.stdout.write('[options] ');
        }
        if (this._argument) {
          process.stdout.write(this._argument);
        }

        console.log();
      }
      if (this._subcommands.length !== 0) {
        process.stdout.write('  ');
        options.commands.forEach(cmd => process.stdout.write(cmd + ' '));
        process.stdout.write((this._action ? '[' : '<'));
        this._subcommands.forEach((cmd, i) => {
          process.stdout.write(i ? '|' : '');
          process.stdout.write(cmd._name);
        });
        console.log((this._action ? ']' : '>'));
      }
      console.log();

      console.log(color.underline.cyan('Description:'));
      console.log(`  ${this._description}\n`);

      if (flags.length !== 0) {
        console.log(color.underline.cyan('Options:'));
        flags.reverse().forEach(flag => {
          if (flag.argument) {
            if (flag.long.length + 11 < flagLength) {
              process.stdout.write('  -' + flag.short + ', --' + flag.long + ' <argument>' + ' '.repeat(flagLength - 11 - flag.long.length));
            }
            else {
              process.stdout.write('  -' + flag.short + ', --' + flag.long + ' <argument>');
            }
          }
          else if (flag.long.length < flagLength) {
            process.stdout.write('  -' + flag.short + ', --' + flag.long + ' '.repeat(flagLength - flag.long.length));
          }
          else {
            process.stdout.write('  -' + flag.short + ', --' + flag.long);
          }

          process.stdout.write('\t' + color.gray(flag.desc) + '\n');
        });
      }
    }

    if (typeof this._afterHelp === 'function') {
      this._afterHelp(options);
    }
  }
}

/*
 * PRIVATE
 */
function parse(cmd, argv) {
  let p;

  options.commands.push(argv[0]);
  cmd._unprocessed = argv.slice(1);

  let nextCommand = (cmd._unprocessed.length && cmd._unprocessed[0][0] !== '-');
  if (nextCommand) {
    nextCommand = cmd._subcommands.some(sub => {
      if (cmd._unprocessed[0] === sub._name || (sub._alias && cmd._unprocessed[0] === sub._alias)) {
        cmd._unprocessed[0] = sub._name;
        p = parse(sub, cmd._unprocessed);
        return true;
      }
      return false;
    });
  }

  if (!nextCommand) {
    options.argv = parseFlags(cmd._unprocessed, cmd._flags);
    options.commandExecuted = cmd;

    if (options.help) {
      cmd.showHelp();
      return Promise.resolve();
    }
    p = cmd._action(options);
  }

  return p;
}

function parseFlags(argv, flags) {
  flags = flags.slice();
  return argv.reduce((acc, cur, i) => {
    const test = flags.some((f, j) => {
      const re = new RegExp('^(-' + f.short + '|--' + f.long + ')');
      if (re.test(cur)) {
        const property = f.long.replace(/-(.)/g, (match, letter) => letter.toUpperCase());
        if (f.argument && cur[1] !== '-' && cur.length > 2) {
          options[property] = cur.substring(2);
        }
        else if (f.argument) {
          options[property] = argv[i + 1];
          argv.splice(i + 1, 1);
        }
        else {
          options[property] = true;
        }

        flags.splice(j, 1);
        return true;
      }
      return false;
    });

    if (!test) {
      acc.push(cur);
    }
    return acc;
  }, []);
}


/*
 * MODULE EXPORTS
 */
const rootCommand = new Command('root', null);
rootCommand.start = function () {
  options = {
    version,
    globalDescription,
    globalFlags,
    commands: []
  };
  options.globalFlags.push({short: 'h', long: 'help', argument: false, desc: 'Print this help message'});

  const argv = parseFlags(process.argv.slice(2), options.globalFlags);
  return parse(rootCommand, [path.basename(process.argv[1]), ...argv]);
};
rootCommand.version = function (v) {
  version = String(v);
  return this;
};
rootCommand.globalDescription = function (desc) {
  globalDescription = String(desc);
  return this;
};
rootCommand.globalFlag = function (short, long, argument, desc) {
  short = String(short);
  long = String(long);
  desc = String(desc);

  globalFlags.push({short: short[0], long, argument, desc});

  return this;
};

module.exports = rootCommand;
