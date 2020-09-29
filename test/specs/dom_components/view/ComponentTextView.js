import ComponentTextView from 'dom_components/view/ComponentTextView';
import Component from 'dom_components/model/Component';

describe('ComponentTextView', () => {
  var fixtures;
  var model;
  var view;

  beforeEach(() => {
    model = new Component();
    view = new ComponentTextView({
      model
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.querySelector('#fixtures');
    fixtures.appendChild(view.render().el);
  });

  afterEach(() => {
    view.remove();
  });

  test('Component empty', () => {
    expect(fixtures.innerHTML).toEqual(
      '<div data-gjs-type="default" data-highlightable="1"></div>'
    );
  });

  test('Input content is stored in model', () => {
    //view.enableEditing();
    view.el.innerHTML = 'test';
    //view.disableEditing();
    //model.get('content').should.equal('test');
  });

  test('Init with content', () => {
    model = new Component({ content: 'test' });
    view = new ComponentTextView({ model });
    fixtures.appendChild(view.render().el);
    expect(view.el.innerHTML).toEqual('test');
  });

  describe('.getContent', () => {
    let fakeRte, fakeRteContent, fakeChildContainer;

    beforeEach(() => {
      fakeRteContent = 'fakeRteContent';

      fakeRte = {
        getContent: jest.fn(() => fakeRteContent)
      };

      fakeChildContainer = {
        innerHTML: 'fakeChildInnerHTML'
      };

      spyOn(view, 'getChildrenContainer').and.returnValue(fakeChildContainer);
    });

    it('should get content from active RTE if available', () => {
      view.activeRte = fakeRte;
      expect(view.getContent()).toEqual(fakeRteContent);
      expect(fakeRte.getContent).toHaveBeenCalled();
    });

    it("should get child container's `innerHTML` if active RTE is not available or if it has no `getContent` function", () => {
      expect(view.getContent()).toEqual(fakeChildContainer.innerHTML);

      fakeRte.getContent = null;
      view.activeRte = fakeRte;
      expect(view.getContent()).toEqual(fakeChildContainer.innerHTML);

      expect(view.getChildrenContainer).toHaveBeenCalledTimes(2);
    });
  });
});
