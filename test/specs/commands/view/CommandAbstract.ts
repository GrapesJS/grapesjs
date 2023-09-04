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

    expect(triggerSpy.mock.calls.length).toBe(3);
    expect(triggerSpy.mock.calls[0]).toEqual(['run:test:before', {}]);
    expect(triggerSpy.mock.calls[1]).toEqual(['run:test', returnValue, {}]);
    expect(triggerSpy.mock.calls[2]).toEqual(['run', 'test', returnValue, {}]);

    expect(runSpy).toBeCalledTimes(1);
    expect(result).toEqual(returnValue);
  });

  test('callRun returns undefined when "abort" option is specified', () => {
    const returnValue = 'result';
    const opts = { abort: true };
    const triggerSpy = jest.spyOn(editor, 'trigger');
    const runSpy = jest.spyOn(command, 'run');
    runSpy.mockReturnValue(returnValue as any);
    const result = command.callRun(editor, opts);

    expect(triggerSpy.mock.calls.length).toBe(2);
    expect(triggerSpy.mock.calls[0]).toEqual(['run:test:before', opts]);
    expect(triggerSpy.mock.calls[1]).toEqual(['abort:test', opts]);

    expect(runSpy).toBeCalledTimes(0);
    expect(result).toEqual(undefined);
  });

  test('callStop returns result', () => {
    const returnValue = 'stopped';
    const triggerSpy = jest.spyOn(editor, 'trigger');
    const runSpy = jest.spyOn(command, 'stop');
    runSpy.mockReturnValue(returnValue as any);
    const result = command.callStop(editor);

    expect(triggerSpy.mock.calls.length).toBe(3);
    expect(triggerSpy.mock.calls[0]).toEqual(['stop:test:before', {}]);
    expect(triggerSpy.mock.calls[1]).toEqual(['stop:test', returnValue, {}]);
    expect(triggerSpy.mock.calls[2]).toEqual(['stop', 'test', returnValue, {}]);

    expect(runSpy).toBeCalledTimes(1);
    expect(result).toEqual(returnValue);
  });
});
