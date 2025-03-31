import EditorModel from '../../../src/editor/model/Editor';
import type Commands from '../../../src/commands';
import type { Command, CommandFunction, CommandOptions } from '../../../src/commands/view/CommandAbstract';

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
      expect(obj.get('test')!.test).toEqual('test');
    });

    test('Default commands after loadDefaultCommands', () => {
      expect(obj.get('select-comp')).not.toBeUndefined();
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
  });
});
