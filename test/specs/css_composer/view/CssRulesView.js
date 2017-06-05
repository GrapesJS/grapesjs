var CssRulesView = require('css_composer/view/CssRulesView');
var CssRules = require('css_composer/model/CssRules');

module.exports = {
  run() {
      describe('CssRulesView', () => {

        let obj;

        before(function () {
          this.$fixtures = $("#fixtures");
          this.$fixture = $('<div class="cssrules-fixture"></div>');
        });

        beforeEach(function () {
          var col = new CssRules([]);
          obj = new CssRulesView({
            collection: col
          });
          this.$fixture.empty().appendTo(this.$fixtures);
          this.$fixture.html(obj.render().el);
        });

        afterEach(() => {
          obj.collection.reset();
        });

        after(function () {
          this.$fixture.remove();
        });

        it('Object exists', () => {
          expect(CssRulesView).toExist();
        });

        it("Collection is empty", () => {
          expect(obj.$el.html()).toNotExist();
        });

        it("Add new rule", () => {
          sinon.stub(obj, "addToCollection");
          obj.collection.add({});
          expect(obj.addToCollection.calledOnce).toExist(true);
        });

        it("Render new rule", () => {
          obj.collection.add({});
          expect(obj.$el.html()).toExist();
        });

    });
  }
};
