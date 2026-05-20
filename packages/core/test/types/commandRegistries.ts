import type { Editor } from '../../src';

interface MyCommandOptions {
  value: number;
}

interface MyCommandResult {
  done: boolean;
}

interface MyCommandStopOptions {
  reason: string;
}

declare module '../../src' {
  interface CommandRegistryRun {
    'my:command': (options: MyCommandOptions) => MyCommandResult;
    'my:stateless': () => number;
  }

  interface CommandRegistryStop {
    'my:command': (options: MyCommandStopOptions) => void;
  }
}

const editor = {} as Editor;

const fullscreenResult: void = editor.runCommand('core:fullscreen');
editor.runCommand('fullscreen', { target: document.body });
// @ts-expect-error Fullscreen target must be an element or selector string
editor.runCommand('core:fullscreen', { target: 1 });

const customResult: MyCommandResult = editor.runCommand('my:command', { value: 1 });
customResult.done;
editor.stopCommand('my:command', { reason: 'done' });
// @ts-expect-error Missing required run options
editor.runCommand('my:command');
// @ts-expect-error Stop options do not match the registry
editor.stopCommand('my:command', { value: 1 });

const statelessResult: number = editor.runCommand('my:stateless');
statelessResult.toFixed();
// @ts-expect-error Stateless commands should not accept options
editor.runCommand('my:stateless', {});

editor.Commands.add('my:command', {
  run(_editor, _sender, options) {
    options.value.toFixed();
    return { done: true };
  },
  stop(_editor, _sender, options) {
    options.reason.toUpperCase();
  },
});

editor.Commands.add('my:command', (_editor, _sender, options) => {
  options.value.toFixed();
  return { done: true };
});

editor.Commands.add('my:stateless', () => 1);

editor.Commands.add('my:command', {
  run(_editor, _sender, options) {
    // @ts-expect-error The command run options should come from the registry
    options.reason.toUpperCase();
    return { done: true };
  },
});

editor.Commands.config.defaultOptions = {
  'my:command': {
    run(options) {
      return { ...options, value: options.value + 1 };
    },
    stop(options) {
      return { ...options, reason: options.reason.toUpperCase() };
    },
  },
  'core:fullscreen': {
    run(options) {
      return { ...options, target: options?.target ?? '.app' };
    },
  },
};
editor.Commands.config.defaultOptions['my:command']?.run?.({ value: 1 });
