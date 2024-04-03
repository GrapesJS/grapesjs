import CommandsEvents from '../../../../src/commands/types';
import CommandAbstract from '../../../../src/commands/view/CommandAbstract';
import Editor from '../../../../src/editor';

describe('CommandAbstract', () => {
  let editor: Editor;
  let command: CommandAbstract;

  beforeEach(() => {
    editor = new Editor();
    command = new CommandAbstract({});
    command.id = 'test';
  });

  test('callRun returns result when no "abort" option specified', () => {
    const returnValue = 'result';
    const triggerSpy = jest.spyOn(editor, 'trigger');
    const runSpy = jest.spyOn(command, 'run');
    runSpy.mockReturnValue(returnValue as any);
    const result = command.callRun(editor);
    const options = {};
    const resOptions = { options, id: command.id, result: returnValue };
    expect(triggerSpy.mock.calls.length).toBe(6);
    expect(triggerSpy.mock.calls[0]).toEqual([`${CommandsEvents.runBeforeCommand}test`, { options }]);
    expect(triggerSpy.mock.calls[1]).toEqual(['run:test:before', options]);
    expect(triggerSpy.mock.calls[2]).toEqual([`${CommandsEvents.runCommand}test`, resOptions]);
    expect(triggerSpy.mock.calls[3]).toEqual([CommandsEvents.run, resOptions]);
    expect(triggerSpy.mock.calls[4]).toEqual(['run:test', returnValue, options]);
    expect(triggerSpy.mock.calls[5]).toEqual(['run', 'test', returnValue, options]);

    expect(runSpy).toBeCalledTimes(1);
    expect(result).toEqual(returnValue);
  });

  test('callRun returns undefined when "abort" option is specified', () => {
    const returnValue = 'result';
    const options = { abort: true };
    const triggerSpy = jest.spyOn(editor, 'trigger');
    const runSpy = jest.spyOn(command, 'run');
    runSpy.mockReturnValue(returnValue as any);
    const result = command.callRun(editor, options);

    expect(triggerSpy.mock.calls.length).toBe(4);
    expect(triggerSpy.mock.calls[0]).toEqual([`${CommandsEvents.runBeforeCommand}test`, { options }]);
    expect(triggerSpy.mock.calls[1]).toEqual(['run:test:before', options]);
    expect(triggerSpy.mock.calls[2]).toEqual([`${CommandsEvents.abort}test`, { options }]);
    expect(triggerSpy.mock.calls[3]).toEqual(['abort:test', options]);

    expect(runSpy).toBeCalledTimes(0);
    expect(result).toEqual(undefined);
  });

  test('callStop returns result', () => {
    const returnValue = 'stopped';
    const triggerSpy = jest.spyOn(editor, 'trigger');
    const runSpy = jest.spyOn(command, 'stop');
    runSpy.mockReturnValue(returnValue as any);
    const result = command.callStop(editor);
    const options = {};
    const resOptions = { options, id: command.id, result: returnValue };

    expect(triggerSpy.mock.calls.length).toBe(6);
    expect(triggerSpy.mock.calls[0]).toEqual([`${CommandsEvents.stopBeforeCommand}test`, { options }]);
    expect(triggerSpy.mock.calls[1]).toEqual(['stop:test:before', options]);
    expect(triggerSpy.mock.calls[2]).toEqual([`${CommandsEvents.stopCommand}test`, resOptions]);
    expect(triggerSpy.mock.calls[3]).toEqual([CommandsEvents.stop, resOptions]);
    expect(triggerSpy.mock.calls[4]).toEqual(['stop:test', returnValue, options]);
    expect(triggerSpy.mock.calls[5]).toEqual(['stop', 'test', returnValue, options]);

    expect(runSpy).toBeCalledTimes(1);
    expect(result).toEqual(returnValue);
  });
});
