var path = 'CssComposer/view/';
define([path + 'CssRulesView', 'CssComposer/model/CssRules'],
  function(CssRulesView, CssRules) {

    return {
      run : function(){
          describe('CssRulesView', function() {

            before(function () {
              this.$fixtures  = $("#fixtures");
              this.$fixture   = $('<div class="cssrules-fixture"></div>');
            });

            beforeEach(function () {
              var col = new CssRules([]);
              this.view = new CssRulesView({
                collection: col
              });
              this.$fixture.empty().appendTo(this.$fixtures);
              this.$fixture.html(this.view.render().el);
            });

            afterEach(function () {
              this.view.collection.reset();
            });

            after(function () {
              this.$fixture.remove();
            });

            it('Object exists', function() {
              CssRulesView.should.be.exist;
            });

            it("Collection is empty", function (){
              this.view.$el.html().should.be.empty;
            });

            it("Add new rule", function (){
              sinon.stub(this.view, "addToCollection");
              this.view.collection.add({});
              this.view.addToCollection.calledOnce.should.equal(true);
            });

            it("Render new rule", function (){
              this.view.collection.add({});
              this.view.$el.html().should.not.be.empty;
            });

        });
      }
    };

});