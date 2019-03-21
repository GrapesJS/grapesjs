module.exports = {
  ESCAPE_KEY: 27,

  stylePrefix: 'com-',

  defaults: [],

  // If true, stateful commands (with `run` and `stop` methods) can't be runned multiple times.
  // So, if the command is already active, running it again will not execute the `run` method
  strict: 1,

  // Editor model
  // @deprecated
  em: null,

  // If true center new first-level components
  // @deprecated
  firstCentered: true,

  // If true the new component will created with 'height', else 'min-height'
  // @deprecated
  newFixedH: false,

  // Minimum height (in px) of new component
  // @deprecated
  minComponentH: 50,

  // Minimum width (in px) of component on creation
  // @deprecated
  minComponentW: 50
};
