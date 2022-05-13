export default {
  stylePrefix: 'com-',

  // Default array of commands
  defaults: [],

  // If true, stateful commands (with `run` and `stop` methods) can't be runned multiple times.
  // So, if the command is already active, running it again will not execute the `run` method
  strict: 1,
};
