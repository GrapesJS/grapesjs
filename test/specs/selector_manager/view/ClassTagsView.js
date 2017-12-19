const ClassTagsView = require('selector_manager/view/ClassTagsView');
const Selectors = require('selector_manager/model/Selectors');
const Editor = require('editor/model/Editor');

module.exports = {
  run() {
      describe('ClassTagsView', () => {

        var view;
        var fixture;
        var fixtures;
        var testLabel;
        var coll;
        var target;
        var em;

        before(() => {
          document.body.innerHTML = '<div id="fixtures"></div>';
          fixtures = document.body.querySelector('#fixtures');
          fixture = $('<div class="classtag-fixture"></div>');
        });

        after(() => {
          fixture.remove();
        });

        beforeEach(function () {
          target = new Editor();
          coll = new Selectors();
          view = new ClassTagsView({
            config : { em: target },
            collection: coll
          });

          this.targetStub = {
            add(v) { return {name: v}; }
          };

          this.compTargetStub = {
              get() { return { add() {} };}
          };

          fixtures.innerHTML = '';
          fixture.empty().appendTo(fixtures);
          fixture.append(view.render().el);
          this.btnAdd = view.$addBtn;
          this.input = view.$el.find('input#' + view.newInputId);
          this.$tags = fixture.find('#tags-c');
          this.$states = fixture.find('#states');
          this.$statesC = fixture.find('#input-c');
        });

        afterEach(() => {
          delete view.collection;
        });

        it('Object exists', () => {
          expect(ClassTagsView).toExist();
        });

        it('Not tags inside', function() {
          expect(this.$tags.html()).toEqual('');
        });

        it('Add new tag triggers correct method', () => {
          sinon.stub(view, "addToClasses");
          coll.add({ name: 'test' });
          expect(view.addToClasses.calledOnce).toEqual(true);
        });

        it('Start new tag creation', function() {
          this.btnAdd.trigger('click');
          expect(this.btnAdd.css('display')).toEqual('none');
          expect(this.input.css('display')).toNotEqual('none');
        });

        it('Stop tag creation', function() {
          this.btnAdd.trigger('click');
          this.input.val('test')
          this.input.trigger('blur');
          expect(this.btnAdd.css('display')).toNotEqual('none');
          expect(this.input.css('display')).toEqual('none');
          expect(this.input.val()).toEqual(null);
        });

        it.skip('Check keyup of ESC on input', function() {
          this.btnAdd.click();
          sinon.stub(view, "addNewTag");
          this.input.trigger({
            type: 'keyup',
            keyCode: 13
           });
          expect(view.addNewTag.calledOnce).toEqual(true);
        });

        it.skip('Check keyup on ENTER on input', function() {
          this.btnAdd.click();
          sinon.stub(view, "endNewTag");
          this.input.trigger({
            type: 'keyup',
            keyCode: 27
           });
          expect(view.endNewTag.calledOnce).toEqual(true);
        });

        it('Collection changes on update of target', () => {
          coll.add({ name: 'test' });
          target.trigger('change:selectedComponent');
          expect(coll.length).toEqual(0);
        });

        it('Collection reacts on reset', () => {
          coll.add([{ name: 'test1' }, { name: 'test2' }]);
          sinon.stub(view, "addToClasses");
          coll.trigger('reset');
          expect(view.addToClasses.calledTwice).toEqual(true);
        });

        it("Don't accept empty tags", function() {
          view.addNewTag('');
          expect(this.$tags.html()).toEqual('');
        });

        it("Accept new tags", function() {
          sinon.stub(target, "get").returns(this.targetStub);
          view.compTarget = this.compTargetStub;
          view.addNewTag('test');
          view.compTarget = this.compTargetStub;
          view.addNewTag('test2');
          expect(this.$tags.children().length).toEqual(2);
        });

        it("New tag correctly added", function() {
          coll.add({ label: 'test' });
          expect(this.$tags.children().first().find('[data-tag-name]').text()).toEqual('test');
        });

        it("States are hidden in case no tags", function() {
          view.updateStateVis();
          expect(this.$statesC.css('display')).toEqual('none');
        });

        it("States are visible in case of more tags inside", function() {
          coll.add({ label: 'test' });
          view.updateStateVis();
          expect(this.$statesC.css('display')).toEqual('block');
        });

        it("Update state visibility on new tag", function() {
          sinon.stub(view, "updateStateVis");
          sinon.stub(target, "get").returns(this.targetStub);
          view.compTarget = this.compTargetStub;
          view.addNewTag('test');
          expect(view.updateStateVis.called).toEqual(true);
        });

        it("Update state visibility on removing of the tag", function() {
          sinon.stub(target, "get").returns(this.targetStub);
          view.compTarget = this.compTargetStub;
          view.addNewTag('test');
          sinon.stub(view, "updateStateVis");
          coll.remove(coll.at(0));
          expect(view.updateStateVis.calledOnce).toEqual(true);
        });

        it("Output correctly state options", () => {
          var view = new ClassTagsView({
            config : {
              em: target,
              states: [ { name: 'testName', label: 'testLabel' } ],
            },
            collection: coll
          });
          expect(view.getStateOptions()).toEqual('<option value="testName">testLabel</option>');
        });

        describe('Should be rendered correctly', () => {
          it('Has label', () => {
            expect(view.$el.find('#label')[0]).toExist();
          });
          it('Has tags container', () => {
            expect(view.$el.find('#tags-c')[0]).toExist();
          });
          it('Has add button', () => {
            expect(view.$el.find('#add-tag')[0]).toExist();
          });
          it('Has states input', () => {
            expect(view.$el.find('#states')[0]).toExist();
          });
        });

    });
  }
};
