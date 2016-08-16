var path = 'SelectorManager/view/';
define([path + 'ClassTagsView', 'SelectorManager/model/Selectors'],
  function(ClassTagsView, Selectors) {

    return {
      run : function(){
          describe('ClassTagsView', function() {

            var view;
            var fixture;
            var fixtures;
            var testLabel;
            var coll;
            var target;

            before(function () {
              fixtures = $("#fixtures");
              fixture = $('<div class="classtag-fixture"></div>');
            });

            beforeEach(function () {
              target = { get: function(){} };
              coll = new Selectors();
              _.extend(target, Backbone.Events);

              view = new ClassTagsView({
                config : { em: target },
                collection: coll
              });

              this.targetStub = {
                add: function(v){ return {name: v}; }
              };

              this.compTargetStub = {
                  get: function(){ return { add: function(){} }}
              };

              fixture.empty().appendTo(fixtures);
              fixture.html(view.render().el);
              this.btnAdd = view.$el.find('#' + view.addBtnId);
              this.input = view.$el.find('input#' + view.newInputId);
              this.$tags = fixture.find('#tags-c');
              this.$states = fixture.find('#states');
              this.$statesC = fixture.find('#input-c');
            });

            afterEach(function () {
              delete view.collection;
            });

            after(function () {
              fixture.remove();
            });

            it('Object exists', function() {
              ClassTagsView.should.be.exist;
            });

            it('Not tags inside', function() {
              this.$tags.html().should.equal('');
            });

            it('Add new tag triggers correct method', function() {
              sinon.stub(view, "addToClasses");
              coll.add({ name: 'test' });
              view.addToClasses.calledOnce.should.equal(true);
            });

            it('Start new tag creation', function() {
              this.btnAdd.click();
              (this.btnAdd.css('display') == 'none').should.equal(true);
              (this.input.css('display') !== 'none').should.equal(true);
            });

            it('Stop tag creation', function() {
              this.btnAdd.click();
              this.input.val('test')
              this.input.blur();
              (this.btnAdd.css('display') !== 'none').should.equal(true);
              (this.input.css('display') == 'none').should.equal(true);
              this.input.val().should.equal('');
            });

            it('Check keyup of ESC on input', function() {
              this.btnAdd.click();
              sinon.stub(view, "addNewTag");
              this.input.trigger({
                type: 'keyup',
                keyCode: 13
               });
              view.addNewTag.calledOnce.should.equal(true);
            });

            it('Check keyup on ENTER on input', function() {
              this.btnAdd.click();
              sinon.stub(view, "endNewTag");
              this.input.trigger({
                type: 'keyup',
                keyCode: 27
               });
              view.endNewTag.calledOnce.should.equal(true);
            });

            it('Collection changes on update of target', function() {
              coll.add({ name: 'test' });
              target.trigger('change:selectedComponent');
              coll.length.should.equal(0);
            });

            it('Collection reacts on reset', function() {
              coll.add([{ name: 'test1' }, { name: 'test2' }]);
              sinon.stub(view, "addToClasses");
              coll.trigger('reset');
              view.addToClasses.calledTwice.should.equal(true);
            });

            it("Don't accept empty tags", function() {
              view.addNewTag('');
              this.$tags.html().should.equal('');
            });

            it("Accept new tags", function() {
              sinon.stub(target, "get").returns(this.targetStub);
              view.compTarget = this.compTargetStub;
              view.addNewTag('test');
              view.compTarget = this.compTargetStub;
              view.addNewTag('test2');
              this.$tags.children().length.should.equal(2);
            });

            it("New tag correctly added", function() {
              coll.add({ label: 'test' });
              this.$tags.children().first().find('#tag-label input').val().should.equal('test');
            });

            it("States are hidden in case no tags", function() {
              view.updateStateVis();
              this.$statesC.css('display').should.equal('none');
            });

            it("States are visible in case of more tags inside", function() {
              coll.add({ label: 'test' });
              view.updateStateVis();
              this.$statesC.css('display').should.equal('block');
            });

            it("Update state visibility on new tag", function() {
              sinon.stub(view, "updateStateVis");
              sinon.stub(target, "get").returns(this.targetStub);
              view.compTarget = this.compTargetStub;
              view.addNewTag('test');
              view.updateStateVis.called.should.equal(true);
            });

            it("Update state visibility on removing of the tag", function() {
              sinon.stub(target, "get").returns(this.targetStub);
              view.compTarget = this.compTargetStub;
              view.addNewTag('test');
              sinon.stub(view, "updateStateVis");
              coll.remove(coll.at(0));
              view.updateStateVis.calledOnce.should.equal(true);
            });

            it("Output correctly state options", function() {
              var view = new ClassTagsView({
                config : {
                  em: target,
                  states: [ { name: 'testName', label: 'testLabel' } ],
                },
                collection: coll
              });
              view.getStateOptions().should.equal('<option value="testName">testLabel</option>');
            });

            describe('Should be rendered correctly', function() {
              it('Has label', function() {
                view.$el.find('#label').should.have.property(0);
              });
              it('Has tags container', function() {
                view.$el.find('#tags-c').should.have.property(0);
              });
              it('Has add button', function() {
                view.$el.find('#add-tag').should.have.property(0);
              });
              it('Has states input', function() {
                view.$el.find('#states').should.have.property(0);
              });
            });

        });
      }
    };

});