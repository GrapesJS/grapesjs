var path = 'ClassManager/view/';
define([path + 'ClassTagView', 'ClassManager/model/ClassTags'],
	function(ClassTagView, ClassTags) {

    return {
      run : function(){
          describe('ClassTagView', function() {

            before(function () {
              this.$fixtures  = $("#fixtures");
              this.$fixture   = $('<div class="classtag-fixture"></div>');
            });

            beforeEach(function () {
              this.coll  = new ClassTags();
              this.testLabel = 'TestLabel';
              var model = this.coll.add({
                name: 'test',
                label: this.testLabel,
              });
              this.view = new ClassTagView({
                config : {},
                model: model,
                coll: this.coll
              });
              this.view.target = { get:function(){} };
              _.extend(this.view.target, Backbone.Events);
              this.$fixture.empty().appendTo(this.$fixtures);
              this.$fixture.html(this.view.render().el);
            });

            afterEach(function () {
              this.view.model.destroy();
            });

            after(function () {
              this.$fixture.remove();
            });

            it('Object exists', function() {
              ClassTagView.should.be.exist;
            });

            it('Not empty', function() {
              var $el = this.view.$el;
              $el.html().should.not.be.empty;
            });

            it('Not empty', function() {
              var $el = this.view.$el;
              $el.html().should.contain(this.testLabel);
            });

            describe('Should be rendered correctly', function() {

                it('Has close button', function() {
                  var $el = this.view.$el;
                  $el.find('#close').should.have.property(0);
                });
                it('Has checkbox', function() {
                  var $el = this.view.$el;
                  $el.find('#checkbox').should.have.property(0);
                });
                it('Has label', function() {
                  var $el = this.view.$el;
                  $el.find('#tag-label').should.have.property(0);
                });

            });

            it('Could be removed', function() {
              var spy = sinon.spy();
              this.view.config.target = { get:function(){} };
              sinon.stub(this.view.config.target, 'get').returns(0);
              this.view.$el.find('#close').trigger('click');
              this.$fixture.html().should.be.empty;
            });

            it('On remove triggers event', function() {
              var spy = sinon.spy();
              sinon.stub(this.view.target, 'get').returns(0);
              this.view.target.on("targetClassRemoved", spy);
              this.view.$el.find('#close').trigger('click');
              spy.called.should.equal(true);
            });

            it('Checkbox toggles status', function() {
              var spy     = sinon.spy();
              this.view.model.on("change:active", spy);
              this.view.model.set('active', true);
              this.view.$el.find('#checkbox').trigger('click');
              this.view.model.get('active').should.equal(false);
              spy.called.should.equal(true);
            });

            it('On toggle triggers event', function() {
              var spy = sinon.spy();
              sinon.stub(this.view.target, 'get').returns(0);
              this.view.target.on("targetClassUpdated", spy);
              this.view.$el.find('#checkbox').trigger('click');
              spy.called.should.equal(true);
            });

            it('Label input is disabled', function() {
              var inputProp = this.view.inputProp;
              this.view.$labelInput.prop(inputProp).should.equal(true);
            });

            it('On double click label input is enable', function() {
              var inputProp = this.view.inputProp;
              this.view.$el.find('#tag-label').trigger('dblclick');
              this.view.$labelInput.prop(inputProp).should.equal(false);
            });

            it('On blur label input turns back disabled', function() {
              var inputProp = this.view.inputProp;
              this.view.$el.find('#tag-label').trigger('dblclick');
              this.view.endEditTag();
              this.view.$labelInput.prop(inputProp).should.equal(true);
            });

        });
      }
    };

});