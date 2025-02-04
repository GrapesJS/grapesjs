/**{START_EVENTS}*/
export enum CommandsEvents {
  /**
   * @event `command:run` Triggered on run of any command.
   * @example
   * editor.on('command:run', ({ id, result, options }) => {
   *  console.log('Command id', id, 'command result', result);
   * });
   */
  run = 'command:run',

  /**
   * @event `command:run:COMMAND-ID` Triggered on run of a specific command.
   * @example
   * editor.on('command:run:my-command', ({ result, options }) => { ... });
   */
  runCommand = 'command:run:',

  /**
   * @event `command:run:before:COMMAND-ID` Triggered before the command is called.
   * @example
   * editor.on('command:run:before:my-command', ({ options }) => { ... });
   */
  runBeforeCommand = 'command:run:before:',

  /**
   * @event `command:abort:COMMAND-ID` Triggered when the command execution is aborted.
   * @example
   * editor.on('command:abort:my-command', ({ options }) => { ... });
   *
   * // The command could be aborted during the before event
   * editor.on('command:run:before:my-command', ({ options }) => {
   *  if (someCondition) {
   *    options.abort = true;
   *  }
   * });
   */
  abort = 'command:abort:',

  /**
   * @event `command:stop` Triggered on stop of any command.
   * @example
   * editor.on('command:stop', ({ id, result, options }) => {
   *  console.log('Command id', id, 'command result', result);
   * });
   */
  stop = 'command:stop',

  /**
   * @event `command:stop:COMMAND-ID` Triggered on stop of a specific command.
   * @example
   * editor.on('command:run:my-command', ({ result, options }) => { ... });
   */
  stopCommand = 'command:stop:',

  /**
   * @event `command:stop:before:COMMAND-ID` Triggered before the command is called to stop.
   * @example
   * editor.on('command:stop:before:my-command', ({ options }) => { ... });
   */
  stopBeforeCommand = 'command:stop:before:',

  /**
   * @event `command:call` Triggered on run or stop of a command.
   * @example
   * editor.on('command:call', ({ id, result, options, type }) => {
   *  console.log('Command id', id, 'command result', result, 'call type', type);
   * });
   */
  call = 'command:call',

  /**
   * @event `command:call:COMMAND-ID` Triggered on run or stop of a specific command.
   * @example
   * editor.on('command:call:my-command', ({ result, options, type }) => { ... });
   */
  callCommand = 'command:call:',
}
/**{END_EVENTS}*/

// need this to avoid the TS documentation generator to break
export default CommandsEvents;
