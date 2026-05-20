import ComponentStyleClear from '../../../../src/commands/view/ComponentStyleClear';

describe('ComponentStyleClear command', () => {
  test('should remove component style rules when no components of that type remain', () => {
    const command = new ComponentStyleClear({});
    const ruleA = { get: jest.fn(() => 'cmp:text') };
    const ruleB = { get: jest.fn(() => 'cmp:image') };
    const rules = {
      filter: jest.fn((predicate: any) => [ruleA, ruleB].filter(predicate)),
      remove: jest.fn(),
    };
    const target = {
      get: jest.fn((key: string) => {
        if (key === 'styles') return true;
        if (key === 'type') return 'text';
      }),
    };
    const editor = {
      Pages: {
        getAllWrappers: jest.fn(() => [{ findType: jest.fn(() => []) }]),
      },
      CssComposer: {
        getAll: jest.fn(() => rules),
      },
    };

    const result = command.run(editor as any, null, { target } as any);

    expect(rules.remove).toHaveBeenCalledWith([ruleA]);
    expect(result).toEqual([ruleA]);
  });

  test('should return empty array when target has no styles', () => {
    const command = new ComponentStyleClear({});
    const target = {
      get: jest.fn((key: string) => (key === 'styles' ? false : 'text')),
    };
    const editor = {
      Pages: { getAllWrappers: jest.fn() },
      CssComposer: { getAll: jest.fn() },
    };

    const result = command.run(editor as any, null, { target } as any);

    expect(editor.Pages.getAllWrappers).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  test('should keep rules when components of that type still exist', () => {
    const command = new ComponentStyleClear({});
    const rules = {
      filter: jest.fn(),
      remove: jest.fn(),
    };
    const target = {
      get: jest.fn((key: string) => {
        if (key === 'styles') return true;
        if (key === 'type') return 'text';
      }),
    };
    const editor = {
      Pages: {
        getAllWrappers: jest.fn(() => [{ findType: jest.fn(() => [{}]) }]),
      },
      CssComposer: {
        getAll: jest.fn(() => rules),
      },
    };

    const result = command.run(editor as any, null, { target } as any);

    expect(editor.CssComposer.getAll).not.toHaveBeenCalled();
    expect(rules.remove).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
