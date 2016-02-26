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
              var coll  = new ClassTags();
              this.testLabel = 'TestLabel';
              var model = coll.add({
                name: 'test',
                label: this.testLabel,
              });
              this.view = new ClassTagView({
                config : {},
                model: model
              });
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

            });

            it('Could be removed', function() {
              var spy = sinon.spy();
              this.view.config.target = { get:function(){} };
              sinon.stub(this.view.config.target, 'get').returns(0);
              this.view.$el.find('#close').trigger('click');
              this.$fixture.html().should.be.empty;
            });

        });
      }
    };

});