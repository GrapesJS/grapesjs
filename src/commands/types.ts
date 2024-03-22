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
  _run = 'run',

  /**
   * @event `command:run:COMMAND_ID` Triggered on run of a specific command.
   * @example
   * editor.on('command:run:my-command', ({ result, options }) => { ... });
   */
  runCommand = 'command:run:',
  _runCommand = 'run:',

  /**
   * @event `command:run:before:COMMAND_ID` Triggered before the command is called.
   * @example
   * editor.on('command:run:before:my-command', ({ options }) => { ... });
   */
  runBeforeCommand = 'command:run:before:',

  /**
   * @event `command:abort:COMMAND_ID` Triggered when the command execution is aborted.
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
  _abort = 'abort:',

  /**
   * @event `command:stop` Triggered on stop of any command.
   * @example
   * editor.on('command:stop', ({ id, result, options }) => {
   *  console.log('Command id', id, 'command result', result);
   * });
   */
  stop = 'command:stop',
  _stop = 'stop',

  /**
   * @event `command:stop:COMMAND_ID` Triggered on stop of a specific command.
   * @example
   * editor.on('command:run:my-command', ({ result, options }) => { ... });
   */
  stopCommand = 'command:stop:',
  _stopCommand = 'stop:',

  /**
   * @event `command:stop:before:COMMAND_ID` Triggered before the command is called to stop.
   * @example
   * editor.on('command:stop:before:my-command', ({ options }) => { ... });
   */
  stopBeforeCommand = 'command:stop:before:',
}
/**{END_EVENTS}*/

// need this to avoid the TS documentation generator to break
export default CommandsEvents;
