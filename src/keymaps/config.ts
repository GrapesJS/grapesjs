import EditorModule from '../editor';

export interface Keymap {
  id: string;
  keys: string;
  handler: string | ((editor: EditorModule) => any);
}

export interface KeymapOptions {
  /**
   * Force the handler to be executed.
   */
  force?: boolean;
  /**
   * Prevent default of the original triggered event.
   */
  prevent?: boolean;
}

export interface KeymapsConfig {
  /**
   * Default keymaps.
   */
  defaults?: Record<string, Omit<Keymap, 'id'> & { opts?: KeymapOptions }>;
}

const config: KeymapsConfig = {
  defaults: {
    'core:undo': {
      keys: '⌘+z, ctrl+z',
      handler: 'core:undo',
    },
    'core:redo': {
      keys: '⌘+shift+z, ctrl+shift+z',
      handler: 'core:redo',
    },
    'core:copy': {
      keys: '⌘+c, ctrl+c',
      handler: 'core:copy',
    },
    'core:paste': {
      keys: '⌘+v, ctrl+v',
      handler: 'core:paste',
    },
    'core:component-next': {
      keys: 's',
      handler: 'core:component-next',
    },
    'core:component-prev': {
      keys: 'w',
      handler: 'core:component-prev',
    },
    'core:component-enter': {
      keys: 'd',
      handler: 'core:component-enter',
    },
    'core:component-exit': {
      keys: 'a',
      handler: 'core:component-exit',
    },
    'core:component-delete': {
      keys: 'backspace, delete',
      handler: 'core:component-delete',
      opts: { prevent: true },
    },
  },
};

export default config;
