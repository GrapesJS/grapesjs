import CssRuleView from '../../../../src/css_composer/view/CssRuleView';
import CssRule from '../../../../src/css_composer/model/CssRule';
import EditorModel from '../../../../src/editor/model/Editor';

describe('CssRuleView', () => {
  let obj: CssRuleView;
  let fixtures: HTMLElement;

  beforeEach(() => {
    const model = new CssRule({} as any, {});
    obj = new CssRuleView({ model });
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.querySelector('#fixtures')!;
    fixtures.appendChild(obj.render().el);
  });

  afterEach(() => {
    obj.model.destroy();
  });

  test('Object exists', () => {
    expect(CssRuleView).toBeTruthy();
  });

  test('Empty style inside', () => {
    expect(fixtures.innerHTML).toEqual('<style></style>');
  });

  test('On update of style always empty as there is no selectors', () => {
    obj.model.set('style', { prop: 'value' });
    expect(fixtures.innerHTML).toEqual('<style></style>');
  });

  test('Preserves CSS text supplied by the mount hook', () => {
    const em = new EditorModel({});
    const rule = em.Css.setRule('.test', { color: 'red' });
    const view = new CssRuleView({ model: rule });
    const css = '.test::before{content:"<span>&amp;</span>";}';
    const mounted = jest.fn();
    em.on('css:mount:before', (props) => (props.css = css));
    em.on('css:mount', mounted);
    view.render();
    expect(view.el.textContent).toBe(css);
    expect(view.el.childNodes).toHaveLength(1);
    expect(mounted).toHaveBeenCalledWith({ rule, ruleView: view, css });
    view.remove();
    em.destroy();
  });

  describe('CssRuleView with selectors', () => {
    let objReg: CssRuleView;

    beforeEach(() => {
      const selectors = [{ name: 'test1' }, { name: 'test2' }] as any;
      const model = new CssRule({ selectors });
      objReg = new CssRuleView({ model });
      objReg.render();
      document.body.innerHTML = '<div id="fixtures"></div>';
      fixtures = document.body.querySelector('#fixtures')!;
      fixtures.appendChild(objReg.el);
    });

    afterEach(() => {
      objReg.model.destroy();
    });

    test('Empty with no style', () => {
      expect(objReg.$el.html()).toEqual('');
    });

    test('Not empty on update of style', () => {
      objReg.model.set('style', { prop: 'value' });
      expect(objReg.$el.html()).toEqual('.test1.test2{prop:value;}');
    });

    test('State correctly rendered', () => {
      objReg.model.set('style', { prop: 'value' });
      objReg.model.set('state', 'hover');
      expect(objReg.$el.html()).toEqual('.test1.test2:hover{prop:value;}');
    });

    test('State render changes on update', () => {
      objReg.model.set('style', { prop: 'value' });
      objReg.model.set('state', 'hover');
      objReg.model.set('state', '');
      expect(objReg.$el.html()).toEqual('.test1.test2{prop:value;}');
    });

    test('Render media queries', () => {
      objReg.model.set('style', { prop: 'value' });
      objReg.model.set('mediaText', '(max-width: 999px)');
      expect(objReg.$el.html()).toEqual('@media (max-width: 999px){.test1.test2{prop:value;}}');
    });

    test('Empty on clear', () => {
      objReg.model.set('style', { prop: 'value' });
      objReg.model.set('style', {});
      expect(objReg.$el.html()).toEqual('');
    });
  });
});
