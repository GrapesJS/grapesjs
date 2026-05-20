import type { CommandObject } from '../view/CommandAbstract';
import type { CommandKnownId, CommandRunOptions, CommandStopOptions } from '../registry';

export interface CommandConfigDefaultOptions<TId extends string = string> {
  run?: (options: CommandRunOptions<TId>) => CommandRunOptions<TId>;
  stop?: (options: CommandStopOptions<TId>) => CommandStopOptions<TId>;
}

export type CommandsDefaultOptions = {
  [TId in CommandKnownId]?: CommandConfigDefaultOptions<TId>;
} & Record<string, CommandConfigDefaultOptions>;

export interface CommandsConfig {
  /**
   * Style prefix
   * @default 'com-'
   */
  stylePrefix?: string;

  /**
   * Default commands
   * @default {}
   */
  defaults?: Record<string, CommandObject>;

  /**
   * If true, stateful commands (with `run` and `stop` methods) can't be executed multiple times.
   * If the command is already active, running it again will not execute the `run` method.
   * @default true
   */
  strict?: boolean;

  /**
   * Default options for commands
   * These options will be merged with the options passed when the command is run.
   * This allows you to define common behavior for commands in one place.
   * @default {}
   * @example
   * defaultOptions: {
   *  'core:component-drag': {
   *    run: (options: Record<string, unknown>) => ({
   *      ...options,
   *      skipGuidesRender: true,
   *      addStyle({ component, styles, partial }) {
   *        component.addStyle(styles, { partial });
   *      },
   *     }),
   *    stop: (options: Record<string, unknown>) => ({
   *      ...options,
   * *     skipGuidesRender: true,
   *      addStyle({ component, styles, partial }) {
   *        component.addStyle(styles, { partial });
   *      },
   *    }),
   *  }
   * }
   */
  defaultOptions?: CommandsDefaultOptions;
}

const config: () => CommandsConfig = () => ({
  stylePrefix: 'com-',
  defaults: {},
  strict: true,
  defaultOptions: {},
});

export default config;
