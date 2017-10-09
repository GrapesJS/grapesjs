var CssRulesView = require('css_composer/view/CssRulesView');
var CssRules = require('css_composer/model/CssRules');

module.exports = {
  run() {
      describe('CssRulesView', () => {

        let obj;

        beforeEach(function () {
          var col = new CssRules([]);
          obj = new CssRulesView({
            collection: col
          });
          document.body.innerHTML = '<div id="fixtures"></div>';
          document.body.querySelector('#fixtures').appendChild(obj.render().el);
        });

        afterEach(() => {
          obj.collection.reset();
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
