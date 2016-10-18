var path = 'SelectorManager/view/';
define([path + 'ClassTagView', 'SelectorManager/model/Selectors'],
	function(ClassTagView, Selectors) {

    return {
      run : function(){
          describe('ClassTagView', function() {

            var obj;
            var fixture;
            var fixtures;
            var testLabel;
            var coll;

            before(function () {
              fixtures = $("#fixtures");
              fixture = $('<div class="classtag-fixture"></div>');
            });

            beforeEach(function () {
              coll  = new Selectors();
              testLabel = 'TestLabel';
              var model = coll.add({
                name: 'test',
                label: testLabel,
              });
              obj = new ClassTagView({
                config : {},
                model: model,
                coll: coll
              });
              obj.target = { get:function(){} };
              _.extend(obj.target, Backbone.Events);
              fixture.empty().appendTo(fixtures);
              fixture.html(obj.render().el);
            });

            afterEach(function () {
              delete obj.model;
            });

            after(function () {
              fixture.remove();
            });

            it('Object exists', function() {
              ClassTagView.should.be.exist;
            });

            it('Not empty', function() {
              var $el = obj.$el;
              $el.html().should.not.be.empty;
            });

            it('Not empty', function() {
              var $el = obj.$el;
              $el.html().should.contain(testLabel);
            });

            describe('Should be rendered correctly', function() {

                it('Has close button', function() {
                  var $el = obj.$el;
                  $el.find('#close').should.have.property(0);
                });
                it('Has checkbox', function() {
                  var $el = obj.$el;
                  $el.find('#checkbox').should.have.property(0);
                });
                it('Has label', function() {
                  var $el = obj.$el;
                  $el.find('#tag-label').should.have.property(0);
                });

            });

            it('Could be removed', function() {
              var spy = sinon.spy();
              obj.config.target = { get:function(){} };
              sinon.stub(obj.config.target, 'get').returns(0);
              obj.$el.find('#close').trigger('click');
              fixture.html().should.be.empty;
            });

            it('On remove triggers event', function() {
              var spy = sinon.spy();
              sinon.stub(obj.target, 'get').returns(0);
              obj.target.on("targetClassRemoved", spy);
              obj.$el.find('#close').trigger('click');
              spy.called.should.equal(true);
            });

            it('Checkbox toggles status', function() {
              var spy     = sinon.spy();
              obj.model.on("change:active", spy);
              obj.model.set('active', true);
              obj.$el.find('#checkbox').trigger('click');
              obj.model.get('active').should.equal(false);
              spy.called.should.equal(true);
            });

            it('On toggle triggers event', function() {
              var spy = sinon.spy();
              sinon.stub(obj.target, 'get').returns(0);
              obj.target.on("targetClassUpdated", spy);
              obj.$el.find('#checkbox').trigger('click');
              spy.called.should.equal(true);
            });

            it('Label input is disabled', function() {
              var inputProp = obj.inputProp;
              obj.$labelInput.prop(inputProp).should.equal(true);
            });

            it('On double click label input is enable', function() {
              var inputProp = obj.inputProp;
              obj.$el.find('#tag-label').trigger('dblclick');
              obj.$labelInput.prop(inputProp).should.equal(false);
            });

            it('On blur label input turns back disabled', function() {
              var inputProp = obj.inputProp;
              obj.$el.find('#tag-label').trigger('dblclick');
              obj.endEditTag();
              obj.$labelInput.prop(inputProp).should.equal(true);
            });

        });
      }
    };

});