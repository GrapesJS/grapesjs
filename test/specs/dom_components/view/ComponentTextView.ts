import ComponentTextView from '../../../../src/dom_components/view/ComponentTextView';
import Component from '../../../../src/dom_components/model/Component';
import Editor from '../../../../src/editor/model/Editor';
import { CustomRTE } from '../../../../src/rich_text_editor/config/config';

describe('ComponentTextView', () => {
  let fixtures: HTMLElement;
  let model;
  let view: ComponentTextView;
  let el: HTMLElement;
  let dcomp;
  let compOpts: any;
  let compViewOpts: any;
  let em: Editor;

  beforeEach(() => {
    em = new Editor({ avoidDefaults: true });
    dcomp = em.Components;
    compOpts = {
      em,
      componentTypes: dcomp.componentTypes,
      domc: dcomp,
    };
    model = new Component({}, compOpts);
    compViewOpts = {
      config: { ...em.config, em },
      model,
    };
    view = new ComponentTextView(compViewOpts);
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.querySelector('#fixtures')!;
    el = view.render().el;
    fixtures.appendChild(el);
  });

  afterEach(() => {
    view.remove();
  });

  test('Component empty', () => {
    expect(fixtures.innerHTML).toEqual(
      `<div data-gjs-highlightable="true" id="${el.id}" data-gjs-type="default"></div>`
    );
  });

  test('Input content is stored in model', () => {
    //view.enableEditing();
    view.el.innerHTML = 'test';
    //view.disableEditing();
    //model.get('content').should.equal('test');
  });

  test('Init with content', () => {
    model = new Component({ content: 'test' }, compOpts);
    view = new ComponentTextView({ ...compViewOpts, model });
    fixtures.appendChild(view.render().el);
    expect(view.el.innerHTML).toEqual('test');
  });

  describe('.getContent', () => {
    let fakeRte: CustomRTE<any>;
    let fakeRteContent = '';
    let fakeChildContainer: InnerHTML;

    beforeEach(() => {
      fakeRteContent = 'fakeRteContent';

      fakeRte = {
        enable() {},
        disable() {},
        getContent: jest.fn(() => fakeRteContent),
      };

      fakeChildContainer = {
        innerHTML: 'fakeChildInnerHTML',
      };

      spyOn(view, 'getChildrenContainer').and.returnValue(fakeChildContainer);
      em.RichTextEditor.customRte = fakeRte;
    });

    it('should get content from active RTE if available', async () => {
      view.activeRte = {} as any;
      expect(await view.getContent()).toEqual(fakeRteContent);
      expect(fakeRte.getContent).toHaveBeenCalled();
    });

    it("should get child container's `innerHTML` if active RTE is not available or if it has no `getContent` function", async () => {
      expect(await view.getContent()).toEqual(fakeChildContainer.innerHTML);

      delete fakeRte.getContent;
      view.activeRte = {} as any;
      expect(await view.getContent()).toEqual(fakeChildContainer.innerHTML);

      expect(view.getChildrenContainer).toHaveBeenCalledTimes(2);
    });
  });
});
