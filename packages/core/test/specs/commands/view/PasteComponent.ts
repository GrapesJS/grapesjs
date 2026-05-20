import { ComponentsEvents } from '../../../../src/dom_components/types';
import PasteComponent from '../../../../src/commands/view/PasteComponent';

describe('PasteComponent command', () => {
  test('should paste a clone into the selected collection and emit paste event', () => {
    const command = new PasteComponent({});
    const added = { id: 'added' };
    const collection = {
      add: jest.fn(() => added),
    };
    const selected = {
      collection,
      index: jest.fn(() => 2),
      get: jest.fn((key: string) => (key === 'copyable' ? true : undefined)),
      clone: jest.fn(() => ({ id: 'clone' })),
      parent: jest.fn(),
    };
    const clipboard = [selected];
    const emitUpdate = jest.fn();
    const trigger = jest.fn();
    const editor = {
      getModel: jest.fn(() => ({
        get: jest.fn((key: string) => (key === 'clipboard' ? clipboard : undefined)),
      })),
      getSelected: jest.fn(() => ({ emitUpdate })),
      getSelectedAll: jest.fn(() => [selected]),
      trigger,
    } as any;

    command.run(editor, null, { action: 'clone-component' });

    expect(collection.add).toHaveBeenCalled();
    expect(trigger).toHaveBeenCalledWith(ComponentsEvents.paste, added);
    expect(emitUpdate).toHaveBeenCalledTimes(1);
  });

  test('should do nothing without clipboard content or selection', () => {
    const command = new PasteComponent({});
    const trigger = jest.fn();
    const editor = {
      getModel: jest.fn(() => ({
        get: jest.fn(() => null),
      })),
      getSelected: jest.fn(() => null),
      getSelectedAll: jest.fn(() => []),
      trigger,
    } as any;

    command.run(editor, null);

    expect(trigger).not.toHaveBeenCalled();
  });
});
