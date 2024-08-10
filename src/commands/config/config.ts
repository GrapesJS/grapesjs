import { CommandObject } from '../view/CommandAbstract';

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
   * The clipboard format used for transferring GrapesJS components.
   * @default 'application/x-grapesjs-component'
   */
  ClipboardComponentFormat?: string;

  /**
   * If true, HTML will be pasted as text
   * @default false
   */
  disableHtmlPasting?: boolean;
}

const config: CommandsConfig = {
  stylePrefix: 'com-',
  defaults: {},
  strict: true,
  ClipboardComponentFormat: 'application/x-grapesjs-component',
  disableHtmlPasting: false,
};

export default config;
