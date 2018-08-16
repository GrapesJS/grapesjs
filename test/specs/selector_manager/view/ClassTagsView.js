const ClassTagsView = require('selector_manager/view/ClassTagsView');
const Selectors = require('selector_manager/model/Selectors');
const Editor = require('editor/model/Editor');

module.exports = {
  run() {
    describe('ClassTagsView', () => {
      let testContext;

      beforeEach(() => {
        testContext = {};
      });

      var view;
      var fixture;
      var fixtures;
      var testLabel;
      var coll;
      var target;
      var em;

      beforeAll(() => {
        document.body.innerHTML = '<div id="fixtures"></div>';
        fixtures = document.body.querySelector('#fixtures');
        fixture = $('<div class="classtag-fixture"></div>');
      });

      afterAll(() => {
        fixture.remove();
      });

      beforeEach(() => {
        target = new Editor();
        coll = new Selectors();
        view = new ClassTagsView({
          config: { em: target },
          collection: coll
        });

        testContext.targetStub = {
          add(v) {
            return { name: v };
          }
        };

        testContext.compTargetStub = {
          get() {
            return { add() {} };
          }
        };

        fixtures.innerHTML = '';
        fixture.empty().appendTo(fixtures);
        fixture.append(view.render().el);
        testContext.btnAdd = view.$addBtn;
        testContext.input = view.$el.find('input#' + view.newInputId);
        testContext.$tags = fixture.find('#tags-c');
        testContext.$states = fixture.find('#states');
        testContext.$statesC = fixture.find('#input-c');
      });

      afterEach(() => {
        delete view.collection;
      });

      test('Object exists', () => {
        expect(ClassTagsView).toBeTruthy();
      });

      test('Not tags inside', () => {
        expect(testContext.$tags.html()).toEqual('');
      });

      test('Add new tag triggers correct method', () => {
        sinon.stub(view, 'addToClasses');
        coll.add({ name: 'test' });
        expect(view.addToClasses.calledOnce).toEqual(true);
      });

      test('Start new tag creation', () => {
        testContext.btnAdd.trigger('click');
        expect(testContext.btnAdd.css('display')).toEqual('none');
        expect(testContext.input.css('display')).not.toEqual('none');
      });

      test('Stop tag creation', () => {
        testContext.btnAdd.trigger('click');
        testContext.input.val('test');
        testContext.input.trigger('blur');
        expect(testContext.btnAdd.css('display')).not.toEqual('none');
        expect(testContext.input.css('display')).toEqual('none');
        expect(testContext.input.val()).toEqual(null);
      });

      test.skip('Check keyup of ESC on input', function() {
        this.btnAdd.click();
        sinon.stub(view, 'addNewTag');
        this.input.trigger({
          type: 'keyup',
          keyCode: 13
        });
        expect(view.addNewTag.calledOnce).toEqual(true);
      });

      test.skip('Check keyup on ENTER on input', function() {
        this.btnAdd.click();
        sinon.stub(view, 'endNewTag');
        this.input.trigger({
          type: 'keyup',
          keyCode: 27
        });
        expect(view.endNewTag.calledOnce).toEqual(true);
      });

      test('Collection changes on update of target', () => {
        coll.add({ name: 'test' });
        target.trigger('component:toggled');
        expect(coll.length).toEqual(0);
      });

      test('Collection reacts on reset', () => {
        coll.add([{ name: 'test1' }, { name: 'test2' }]);
        sinon.stub(view, 'addToClasses');
        coll.trigger('reset');
        expect(view.addToClasses.calledTwice).toEqual(true);
      });

      test("Don't accept empty tags", () => {
        view.addNewTag('');
        expect(testContext.$tags.html()).toEqual('');
      });

      test('Accept new tags', () => {
        view.compTarget = testContext.compTargetStub;
        view.addNewTag('test');
        view.compTarget = testContext.compTargetStub;
        view.addNewTag('test2');
        expect(testContext.$tags.children().length).toEqual(2);
      });

      test('New tag correctly added', () => {
        coll.add({ label: 'test' });
        expect(
          testContext.$tags
            .children()
            .first()
            .find('[data-tag-name]')
            .text()
        ).toEqual('test');
      });

      test('States are hidden in case no tags', () => {
        view.updateStateVis();
        expect(testContext.$statesC.css('display')).toEqual('none');
      });

      test('States are visible in case of more tags inside', () => {
        coll.add({ label: 'test' });
        view.updateStateVis();
        expect(testContext.$statesC.css('display')).toEqual('block');
      });

      test('Update state visibility on new tag', () => {
        sinon.stub(view, 'updateStateVis');
        sinon.stub(target, 'get').returns(testContext.targetStub);
        view.compTarget = testContext.compTargetStub;
        view.addNewTag('test');
        expect(view.updateStateVis.called).toEqual(true);
      });

      test('Update state visibility on removing of the tag', () => {
        view.compTarget = testContext.compTargetStub;
        view.addNewTag('test');
        sinon.stub(view, 'updateStateVis');
        coll.remove(coll.at(0));
        expect(view.updateStateVis.calledOnce).toEqual(true);
      });

      test('Output correctly state options', () => {
        var view = new ClassTagsView({
          config: {
            em: target,
            states: [{ name: 'testName', label: 'testLabel' }]
          },
          collection: coll
        });
        expect(view.getStateOptions()).toEqual(
          '<option value="testName">testLabel</option>'
        );
      });

      describe('Should be rendered correctly', () => {
        test('Has label', () => {
          expect(view.$el.find('#label')[0]).toBeTruthy();
        });
        test('Has tags container', () => {
          expect(view.$el.find('#tags-c')[0]).toBeTruthy();
        });
        test('Has add button', () => {
          expect(view.$el.find('#add-tag')[0]).toBeTruthy();
        });
        test('Has states input', () => {
          expect(view.$el.find('#states')[0]).toBeTruthy();
        });
      });
    });
  }
};
