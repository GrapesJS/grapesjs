const CssRulesView = require('css_composer/view/CssRulesView');
const CssRules = require('css_composer/model/CssRules');
const CssRule = require('css_composer/model/CssRule');
const Editor = require('editor/model/Editor');

module.exports = {
  run() {
    describe('CssRulesView', () => {
      let obj;
      const prefix = 'rules-';
      const devices = [
        {
          name: 'Desktop',
          width: '',
          widthMedia: ''
        },
        {
          name: 'Tablet',
          width: '768px',
          widthMedia: '992px'
        }
      ];

      beforeEach(function() {
        const col = new CssRules([]);
        obj = new CssRulesView({
          collection: col,
          config: {
            em: new Editor({
              deviceManager: {
                devices
              }
            })
          }
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

      it('Collection is empty. Styles structure bootstraped', () => {
        expect(obj.$el.html()).toExist();
        const foundStylesContainers = obj.$el.find('div');
        expect(foundStylesContainers.length).toEqual(devices.length);
        foundStylesContainers.each(function($styleC, idx) {
          expect($styleC.id).toEqual(prefix + devices[idx].widthMedia);
        });
      });

      it('Add new rule', () => {
        sinon.stub(obj, 'addToCollection');
        obj.collection.add({});
        expect(obj.addToCollection.calledOnce).toExist(true);
      });

      it('Render new rule', () => {
        obj.collection.add({});
        expect(
          obj.$el.find(`#${prefix}${devices[0].widthMedia}`).html()
        ).toExist();
      });
    });
  }
};
