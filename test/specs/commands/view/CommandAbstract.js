import CommandAbstract from 'commands/view/CommandAbstract';
import Editor from 'editor/model/Editor';

describe('CommandAbstract', () => {
  let editor, editorTriggerSpy, command;

  beforeEach(() => {
    editor = new Editor();
    editorTriggerSpy = sinon.spy(editor, 'trigger');

    command = new CommandAbstract();
    command.id = 'test';
  });

  afterEach(() => {
    command = null;
    editorTriggerSpy = null;
    editor = null;
  });

  test('callRun returns result when no "abort" option specified', () => {
    const runStub = sinon.stub(command, 'run').returns('result');

    const result = command.callRun(editor);
    expect(editorTriggerSpy.callCount).toEqual(3);
    expect(editorTriggerSpy.getCall(0).args).toEqual(['run:test:before', {}]);
    expect(editorTriggerSpy.getCall(1).args).toEqual([
      'run:test',
      'result',
      {}
    ]);
    expect(editorTriggerSpy.getCall(2).args).toEqual([
      'run',
      'test',
      'result',
      {}
    ]);

    expect(result).toEqual('result');
    expect(runStub.calledOnce).toEqual(true);
  });

  test('callRun returns undefined when "abort" option is specified', () => {
    const runStub = sinon.stub(command, 'run').returns('result');

    const result = command.callRun(editor, { abort: true });

    expect(editorTriggerSpy.calledTwice).toEqual(true);
    expect(editorTriggerSpy.getCall(0).args).toEqual([
      'run:test:before',
      { abort: true }
    ]);
    expect(editorTriggerSpy.getCall(1).args).toEqual([
      'abort:test',
      { abort: true }
    ]);

    expect(result).toEqual(undefined);
    expect(runStub.notCalled).toEqual(true);
  });

  test('callStop returns result', () => {
    const stopStub = sinon.stub(command, 'stop').returns('stopped');

    const result = command.callStop(editor);

    expect(editorTriggerSpy.callCount).toEqual(3);
    expect(editorTriggerSpy.getCall(0).args).toEqual(['stop:test:before', {}]);
    expect(editorTriggerSpy.getCall(1).args).toEqual([
      'stop:test',
      'stopped',
      {}
    ]);
    expect(editorTriggerSpy.getCall(2).args).toEqual([
      'stop',
      'test',
      'stopped',
      {}
    ]);

    expect(result).toEqual('stopped');
    expect(stopStub.calledOnce).toEqual(true);
  });
});
