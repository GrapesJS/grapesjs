import Editor from '../../../src/editor/model/Editor';
import ComponentWrapper from '../../../src/dom_components/model/ComponentWrapper';

// https://github.com/GrapesJS/grapesjs/pull/6095
describe('Checkbox Behaviour', () => {
  let em: Editor;
  let fixtures: HTMLElement;
  let cmpRoot: ComponentWrapper;

  beforeEach(() => {
    em = new Editor({
      mediaCondition: 'max-width',
      avoidInlineStyle: true,
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    const { Pages, Components } = em;
    Pages.onLoad();
    cmpRoot = Components.getWrapper()!;
    const View = Components.getType('wrapper')!.view;
    const wrapperEl = new View({
      model: cmpRoot,
      config: { ...cmpRoot.config, em },
    });
    wrapperEl.render();
    fixtures = document.body.querySelector('#fixtures')!;
    fixtures.appendChild(wrapperEl.el);
  });

  afterEach(() => {
    em.destroy();
  });

  test('init checkbox to true then change value and assert changes', () => {
    const cmp = cmpRoot.append({
      type: 'checkbox',
      tagName: 'input',
      attributes: { type: 'checkbox', name: 'my-checkbox' },
      traits: [
        {
          type: 'checkbox',
          label: 'Checked',
          name: 'checked',
          value: 'true',
          valueTrue: 'true',
          valueFalse: 'false',
        },
      ],
    })[0];

    const input = cmp.getEl() as HTMLInputElement;
    expect(cmp.getAttributes().checked).toBe('true');
    expect(input?.checked).toBe(true);
    expect(input?.getAttribute('checked')).toBe('true');

    cmp.getTrait('checked').setValue(false);

    expect(input?.getAttribute('checked')).toBe('false');
  });
});
