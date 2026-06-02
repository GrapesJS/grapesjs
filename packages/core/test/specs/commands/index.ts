import type { Editor } from '../../../src';
import EditorModel from '../../../src/editor/model/Editor';
import type Commands from '../../../src/commands';
import type { Command, CommandFunction, CommandOptions } from '../../../src/commands/view/CommandAbstract';
import CommandAbstract from '../../../src/commands/view/CommandAbstract';

describe('Commands', () => {
  describe('Main', () => {
    let em: EditorModel;
    let obj: Commands;
    let commSimple: Command;
    let commRunOnly: Command;
    let commFunc: CommandFunction;
    let commName = 'commandTest';
    let commResultRun = 'Run executed';
    let commResultStop = 'Stop executed';

    beforeEach(() => {
      commSimple = {
        run: () => commResultRun,
        stop: () => commResultStop,
      };
      commRunOnly = {
        run: () => commResultRun,
      };
      commFunc = () => commResultRun;
      em = new EditorModel();
      em.set('Editor', em);
      obj = em.Commands;
    });

    afterEach(() => {
      em.destroy();
    });

    test('No commands inside', () => {
      expect(obj.get('test')).toBeUndefined();
    });

    test('Push new command', () => {
      const comm = { test: 'test' };
      const len = Object.keys(obj.getAll()).length;
      obj.add('test', comm);
      expect(obj.has('test')).toBe(true);
      expect(Object.keys(obj.getAll()).length).toBe(len + 1);
      expect((obj.get('test') as any).test).toEqual('test');
    });

    test('Remove command', () => {
      obj.add('test', commSimple);

      obj.remove('test');

      expect(obj.has('test')).toBe(false);
      expect(obj.getAll().test).toBeUndefined();
    });

    test('Remove active command and clean up active state', () => {
      const stop = jest.fn(() => commResultStop);
      obj.add(commName, {
        run: () => commResultRun,
        stop,
      });
      obj.run(commName);

      obj.remove(commName);

      expect(stop).toHaveBeenCalledTimes(1);
      expect(obj.isActive(commName)).toBe(false);
      expect(obj.has(commName)).toBe(false);
    });

    test('Default commands after loadDefaultCommands', () => {
      expect(obj.get('select-comp')).not.toBeUndefined();
    });

    test('Select component command cancels pending debounced callbacks on teardown', () => {
      const command = obj.get('select-comp') as any;
      const cancelOnContainerChange = jest.fn();
      const cancelOnSelect = jest.fn();
      const cancelUpdateAttached = jest.fn();
      const cancelToolbar = jest.fn();
      command.toggleSelectComponent = jest.fn();
      command.onContainerChange = { cancel: cancelOnContainerChange };
      command.onSelect = { cancel: cancelOnSelect };
      command.updateAttached = { cancel: cancelUpdateAttached };
      command._upToolbar = { cancel: cancelToolbar };

      command.stopSelectComponent();

      expect(command.toggleSelectComponent).toHaveBeenCalledWith();
      expect(cancelOnContainerChange).toHaveBeenCalledTimes(1);
      expect(cancelOnSelect).toHaveBeenCalledTimes(1);
      expect(cancelUpdateAttached).toHaveBeenCalledTimes(1);
      expect(cancelToolbar).toHaveBeenCalledTimes(1);
    });

    test('Commands module should not have toLoad property', () => {
      // @ts-ignore
      expect(obj.toLoad).toBeUndefined();
    });

    test('Run simple command and check if the state is tracked', () => {
      // Add the command
      obj.add(commName, commSimple);
      expect(obj.isActive(commName)).toBe(false);

      // Start the command
      let result = obj.run(commName);
      expect(result).toBe(commResultRun);
      expect(obj.isActive(commName)).toBe(true);
      expect(Object.keys(obj.getActive()).length).toBe(1);

      // Stop the command
      result = obj.stop(commName);
      expect(result).toBe(commResultStop);
      expect(obj.isActive(commName)).toBe(false);
      expect(Object.keys(obj.getActive()).length).toBe(0);
    });

    test('Run command only with run method, ensure is not tracked', () => {
      // Add the command
      obj.add(commName, commRunOnly);
      expect(obj.isActive(commName)).toBe(false);

      // Start the command
      let result = obj.run(commName);
      expect(result).toBe(commResultRun);
      expect(obj.isActive(commName)).toBe(false);
      expect(Object.keys(obj.getActive()).length).toBe(0);
    });

    test('Run function command, ensure is not tracked', () => {
      // Add the command
      obj.add(commName, commFunc);
      expect(obj.isActive(commName)).toBe(false);

      // Start the command
      let result = obj.run(commName);
      expect(result).toBe(commResultRun);
      expect(obj.isActive(commName)).toBe(false);
      expect(Object.keys(obj.getActive()).length).toBe(0);
    });

    test('Run command and check if none, custom, and default options are passed', () => {
      const customOptions = { customValue: 'customValue' };
      const defaultOptions = { defaultValue: 'defaultValue' };

      // Create a function that returns the options
      const runFn = (_editor: any, _sender: any, options: any) => options;

      // Add the command
      obj.add(commName, { run: runFn });

      // Run the command without custom options
      let result = obj.run(commName);
      expect(result).toEqual({});

      // Run the command with custom options
      result = obj.run(commName, customOptions);
      expect(result).toEqual(customOptions);

      // Set default options for the command
      obj.config.defaultOptions = {
        [commName]: {
          run: (options: CommandOptions) => ({ ...options, ...defaultOptions }),
        },
      };

      // Run the command with default options
      result = obj.run(commName, customOptions);
      expect(result).toEqual({ ...customOptions, ...defaultOptions });
    });

    test('Command constructor aliases keep independent ids and events', () => {
      class SharedCommand extends CommandAbstract {
        run() {
          return commResultRun;
        }

        stop() {
          return commResultStop;
        }
      }

      const runSpy = jest.fn();
      const stopSpy = jest.fn();

      obj.add('core:test', SharedCommand);
      obj.add('test', SharedCommand);

      expect(obj.get('core:test')?.id).toBe('core:test');
      expect(obj.get('test')?.id).toBe('test');

      em.on('command:run:core:test', runSpy);
      em.on('command:stop:core:test', stopSpy);

      obj.run('core:test');
      expect(obj.isActive('core:test')).toBe(true);
      expect(obj.isActive('test')).toBe(false);
      expect(runSpy).toHaveBeenCalledTimes(1);

      obj.stop('core:test');
      expect(obj.isActive('core:test')).toBe(false);
      expect(stopSpy).toHaveBeenCalledTimes(1);
    });

    test('Default command aliases keep their registered ids', () => {
      expect(obj.get('core:preview')?.id).toBe('core:preview');
      expect(obj.get('preview')?.id).toBe('preview');
      expect(obj.get('core:fullscreen')?.id).toBe('core:fullscreen');
      expect(obj.get('fullscreen')?.id).toBe('fullscreen');
      expect(obj.get('core:component-outline')?.id).toBe('core:component-outline');
      expect(obj.get('sw-visibility')?.id).toBe('sw-visibility');
    });
  });
});

interface MyCommandOptions {
  value: number;
}

interface MyCommandResult {
  done: boolean;
}

interface MyCommandStopOptions {
  reason: string;
}

declare module '../../../src' {
  interface CommandRegistryRun {
    'my:command': (options: MyCommandOptions) => MyCommandResult;
    'my:stateless': () => number;
  }

  interface CommandRegistryStop {
    'my:command': (options: MyCommandStopOptions) => void;
  }
}

const assertCommandTypes = () => {
  const typedEditor = {} as Editor;

  const fullscreenResult: void = typedEditor.runCommand('core:fullscreen');
  typedEditor.runCommand('fullscreen', { target: document.body });
  // @ts-expect-error Fullscreen target must be an element or selector string
  typedEditor.runCommand('core:fullscreen', { target: 1 });

  const customResult: MyCommandResult = typedEditor.runCommand('my:command', { value: 1 });
  customResult.done;
  typedEditor.stopCommand('my:command', { reason: 'done' });
  // @ts-expect-error Missing required run options
  typedEditor.runCommand('my:command');
  // @ts-expect-error Stop options do not match the registry
  typedEditor.stopCommand('my:command', { value: 1 });

  const statelessResult: number = typedEditor.runCommand('my:stateless');
  statelessResult.toFixed();
  // @ts-expect-error Stateless commands should not accept options
  typedEditor.runCommand('my:stateless', {});

  typedEditor.Commands.add('my:command', {
    run(_editor, _sender, options) {
      options.value.toFixed();
      return { done: true };
    },
    stop(_editor, _sender, options) {
      options.reason.toUpperCase();
    },
  });

  typedEditor.Commands.add('my:command', (_editor, _sender, options) => {
    options.value.toFixed();
    return { done: true };
  });

  typedEditor.Commands.add('my:stateless', () => 1);

  typedEditor.Commands.add('my:command', {
    run(_editor, _sender, options) {
      // @ts-expect-error The command run options should come from the registry
      options.reason.toUpperCase();
      return { done: true };
    },
  });

  typedEditor.Commands.config.defaultOptions = {
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
  typedEditor.Commands.config.defaultOptions['my:command']?.run?.({ value: 1 });

  return fullscreenResult;
};

void assertCommandTypes;
