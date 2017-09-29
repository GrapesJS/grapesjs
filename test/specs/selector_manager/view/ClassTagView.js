const ClassTagView = require('selector_manager/view/ClassTagView');
const Selectors = require('selector_manager/model/Selectors');

module.exports = {
  run() {
      describe('ClassTagView', () => {

        var obj;
        var fixtures;
        var testLabel;
        var coll;

        beforeEach(() => {
          coll  = new Selectors();
          testLabel = 'TestLabel';
          var model = coll.add({
            name: 'test',
            label: testLabel,
          });
          obj = new ClassTagView({
            config : {},
            model,
            coll
          });
          obj.target = { get() {} };
          _.extend(obj.target, Backbone.Events);
          document.body.innerHTML = '<div id="fixtures"></div>';
          fixtures = document.body.querySelector('#fixtures');
          fixtures.appendChild(obj.render().el);
        });

        afterEach(() => {
          obj.model = null;
        });

        it('Object exists', () => {
          expect(ClassTagView).toExist();
        });

        it('Not empty', () => {
          var $el = obj.$el;
          expect($el.html()).toExist();
        });

        it('Not empty', () => {
          var $el = obj.$el;
          expect($el.html()).toContain(testLabel);
        });

        describe('Should be rendered correctly', () => {

            it('Has close button', () => {
              var $el = obj.$el;
              expect($el.find('#close')[0]).toExist();
            });
            it('Has checkbox', () => {
              var $el = obj.$el;
              expect($el.find('#checkbox')[0]).toExist();
            });
            it('Has label', () => {
              var $el = obj.$el;
              expect($el.find('#tag-label')[0]).toExist();
            });

        });

        it('Could be removed', () => {
          obj.$el.find('#close').trigger('click');
          setTimeout(() => expect(fixtures.innerHTML).toNotExist(), 0)
        });

        it('On remove triggers event', () => {
          var spy = sinon.spy();
          sinon.stub(obj.target, 'get').returns(0);
          obj.target.on("targetClassRemoved", spy);
          obj.$el.find('#close').trigger('click');
          expect(spy.called).toEqual(true);
        });

        it('Checkbox toggles status', () => {
          var spy     = sinon.spy();
          obj.model.on("change:active", spy);
          obj.model.set('active', true);
          obj.$el.find('#checkbox').trigger('click');
          expect(obj.model.get('active')).toEqual(false);
          expect(spy.called).toEqual(true);
        });

        it('On toggle triggers event', () => {
          var spy = sinon.spy();
          sinon.stub(obj.target, 'get').returns(0);
          obj.target.on("targetClassUpdated", spy);
          obj.$el.find('#checkbox').trigger('click');
          expect(spy.called).toEqual(true);
        });

        it('Label input is disabled', () => {
          var inputProp = obj.inputProp;
          var label = obj.$labelInput.get(0);
          expect(obj.$labelInput.prop(inputProp)).toEqual(true);
        });

        it('On double click label input is enable', () => {
          var inputProp = obj.inputProp;
          obj.$el.find('#tag-label').trigger('dblclick');
          expect(obj.$labelInput.prop(inputProp)).toEqual(false);
        });

        it('On blur label input turns back disabled', () => {
          var inputProp = obj.inputProp;
          obj.$el.find('#tag-label').trigger('dblclick');
          obj.endEditTag();
          expect(obj.$labelInput.prop(inputProp)).toEqual(true);
        });

    });
  }
};
