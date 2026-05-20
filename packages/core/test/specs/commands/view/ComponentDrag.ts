import ComponentDrag from '../../../../src/commands/view/ComponentDrag';

describe('ComponentDrag command', () => {
  test('getTranslate should extract axis values from transform', () => {
    const command = new ComponentDrag({});

    expect(command.getTranslate('translateX(10px) translateY(20px)')).toBe(10);
    expect(command.getTranslate('translateX(10px) translateY(20px)', 'y')).toBe(20);
  });

  test('setTranslate should update and append translate values', () => {
    const command = new ComponentDrag({});

    expect(command.setTranslate('translateX(10px)', 'x', '15px')).toContain('translateX(15px)');
    expect(command.setTranslate('translateX(10px)', 'y', '20px')).toContain('translateY(20px)');
  });

  test('run should require target option', () => {
    const command = new ComponentDrag({});

    expect(() => command.run({} as any, null, {} as any)).toThrow('Target option is required');
  });
});
