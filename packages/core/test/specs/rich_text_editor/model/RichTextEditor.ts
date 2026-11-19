import EditorModel from '../../../../src/editor/model/Editor';
import RichTextEditor from '../../../../src/rich_text_editor/model/RichTextEditor';

describe('RichTextEditor Enter handling', () => {
  let editor: EditorModel;
  let rte: RichTextEditor;
  let editable: HTMLElement;
  const execCommand = jest.fn(() => true);
  const queryCommandState = jest.fn((_command: string) => false);

  const pressEnter = (options: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true, ...options });
    editable.dispatchEvent(event);
    return event;
  };

  beforeEach(() => {
    editor = new EditorModel();
    const doc = document.implementation.createHTMLDocument('');
    editable = doc.createElement('div');
    doc.body.appendChild(editable);
    execCommand.mockClear();
    queryCommandState.mockReset().mockReturnValue(false);
    doc.execCommand = execCommand;
    doc.queryCommandState = queryCommandState;
    doc.queryCommandSupported = () => false;
    rte = new RichTextEditor(editor, editable);
    rte.enable({});
  });

  afterEach(() => {
    rte.disable();
    editor.destroy();
  });

  test.each([{ isComposing: true }, { keyCode: 229 }])(
    'leaves input composition Enter to the browser (%j)',
    (options) => {
      expect(pressEnter(options).defaultPrevented).toBe(false);
      expect(execCommand).not.toHaveBeenCalled();
    },
  );

  test('inserts a line break for ordinary Enter', () => {
    expect(pressEnter().defaultPrevented).toBe(true);
    expect(execCommand).toHaveBeenCalledWith('insertLineBreak');
  });

  test('lets the browser handle Enter in a list', () => {
    queryCommandState.mockImplementation((command) => command === 'insertUnorderedList');

    expect(pressEnter().defaultPrevented).toBe(false);
    expect(execCommand).not.toHaveBeenCalled();
  });

  test('passes composing Enter to a configured keydown handler', () => {
    const onKeydown = jest.fn();
    editor.RichTextEditor.getConfig().onKeydown = onKeydown;

    const ev = pressEnter({ isComposing: true });

    expect(onKeydown).toHaveBeenCalledWith({ ev, rte, editor: editor.getEditor() });
    expect(execCommand).not.toHaveBeenCalled();
  });
});
