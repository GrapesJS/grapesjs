var path = 'ClassManager/view/';
define([path + 'ClassTagsView', 'ClassManager/model/ClassTags'],
  function(ClassTagsView, ClassTags) {

    return {
      run : function(){
          describe('ClassTagsView', function() {

            before(function () {
              this.$fixtures  = $("#fixtures");
              this.$fixture   = $('<div class="classtag-fixture"></div>');
            });

            beforeEach(function () {
              var target = {};
              this.coll  = new ClassTags();
              _.extend(target, Backbone.Events);

              this.view = new ClassTagsView({
                config : { target: target },
                collection: this.coll
              });

              this.$fixture.empty().appendTo(this.$fixtures);
              this.$fixture.html(this.view.render().el);
              this.btnAdd = this.view.$el.find('#' + this.view.addBtnId);
              this.input = this.view.$el.find('input#' + this.view.newInputId);
            });

            afterEach(function () {
              delete this.view.collection;
            });

            after(function () {
              this.$fixture.remove();
            });

            it('Object exists', function() {
              ClassTagsView.should.be.exist;
            });

            it('Add new tag triggers correct method', function() {
              sinon.stub(this.view, "addToClasses");
              this.coll.add({ name: 'test' });
              this.view.addToClasses.calledOnce.should.equal(true);
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

            //this.$el.find('#' + this.addBtnId);
        });
      }
    };

});