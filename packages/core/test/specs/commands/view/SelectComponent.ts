import SelectComponent from '../../../../src/commands/view/SelectComponent';

describe('SelectComponent command', () => {
  test('select should update editor selection and initialize resize', () => {
    const command = new SelectComponent({});
    const selected = { id: 'cmp-selected' };
    const setSelected = jest.fn();
    const getSelected = jest.fn(() => selected);
    command.em = { setSelected, getSelected } as any;
    command.initResize = jest.fn();
    const model = { id: 'cmp-1' } as any;
    const event = {} as MouseEvent;

    command.select(model, event);

    expect(setSelected).toHaveBeenCalledWith(model, { event, useValid: true });
    expect(command.initResize).toHaveBeenCalledWith(selected);
  });

  test('hideBadge should hide the badge element', () => {
    const command = new SelectComponent({});
    const badge = document.createElement('div');
    badge.style.display = 'block';
    command.getBadge = jest.fn(() => badge);

    command.hideBadge();

    expect(badge.style.display).toBe('none');
  });
});
