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
    const resCallOptions = { ...resOptions, type: 'run' };

    expect(triggerSpy.mock.calls.length).toBe(5);
    expect(triggerSpy.mock.calls[0]).toEqual([`${CommandsEvents.runBeforeCommand}test`, { options }]);
    expect(triggerSpy.mock.calls[1]).toEqual([`${CommandsEvents.runCommand}test`, resOptions]);
    expect(triggerSpy.mock.calls[2]).toEqual([`${CommandsEvents.callCommand}test`, resCallOptions]);
    expect(triggerSpy.mock.calls[3]).toEqual([CommandsEvents.run, resOptions]);
    expect(triggerSpy.mock.calls[4]).toEqual([CommandsEvents.call, resCallOptions]);

    expect(runSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(returnValue);
  });

  test('callRun returns undefined when "abort" option is specified', () => {
    const returnValue = 'result';
    const options = { abort: true };
    const triggerSpy = jest.spyOn(editor, 'trigger');
    const runSpy = jest.spyOn(command, 'run');
    runSpy.mockReturnValue(returnValue as any);
    const result = command.callRun(editor, options);

    expect(triggerSpy.mock.calls.length).toBe(2);
    expect(triggerSpy.mock.calls[0]).toEqual([`${CommandsEvents.runBeforeCommand}test`, { options }]);
    expect(triggerSpy.mock.calls[1]).toEqual([`${CommandsEvents.abort}test`, { options }]);

    expect(runSpy).toHaveBeenCalledTimes(0);
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
    const resCallOptions = { ...resOptions, type: 'stop' };

    expect(triggerSpy.mock.calls.length).toBe(5);
    expect(triggerSpy.mock.calls[0]).toEqual([`${CommandsEvents.stopBeforeCommand}test`, { options }]);
    expect(triggerSpy.mock.calls[1]).toEqual([`${CommandsEvents.stopCommand}test`, resOptions]);
    expect(triggerSpy.mock.calls[2]).toEqual([`${CommandsEvents.callCommand}test`, resCallOptions]);
    expect(triggerSpy.mock.calls[3]).toEqual([CommandsEvents.stop, resOptions]);
    expect(triggerSpy.mock.calls[4]).toEqual([CommandsEvents.call, resCallOptions]);

    expect(runSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(returnValue);
  });
});
