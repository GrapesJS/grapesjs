const Selectors = require('selector_manager/model/Selectors');
const ClassTagsView = require('selector_manager/view/ClassTagsView');

module.exports = {
  run() {
      describe('E2E tests', () => {

        var instClassTagViewer = ctx => {
          var $clm;
          var clm = ctx.gjs.editor.get('SelectorManager');
          if(clm){
            $clm = new ClassTagsView({
              collection: new Selectors([]),
              config: {
                em: ctx.gjs.editor
              },
            }).render();
            ctx.$fixture.append($clm.el);
          }
          return $clm;
        };

        before(function () {
          this.$fixtures  = $("#fixtures");
          this.$fixture   = $('<div id="SelectorManager-fixture"></div>');
        });

        beforeEach(function () {
          this.gjs = grapesjs.init({
            stylePrefix: '',
            storageManager: { autoload: 0, type:'none' },
            assetManager: {
              storageType: 'none',
            },
            container: '#SelectorManager-fixture',
          });
          this.$fixture.empty().appendTo(this.$fixtures);
          this.gjs.render();
        });

        afterEach(function () {
          delete this.gjs;
        });

        after(function () {
          this.$fixture.remove();
        });

        describe('Interaction with Components', () => {

          beforeEach(function () {
            this.wrapper = this.gjs.editor.get('DomComponents').getWrapper().get('components');
            this.$clm = instClassTagViewer(this);
          });

          afterEach(function () {
            delete this.wrapper;
            delete this.$clm;
          });

          it('Assign correctly new class to component', function() {
            var model = this.wrapper.add({});
            expect(model.get('classes').length).toEqual(0);
            this.gjs.editor.set('selectedComponent', model);
            this.$clm.addNewTag('test');
            expect(model.get('classes').length).toEqual(1);
            expect(model.get('classes').at(0).get('name')).toEqual('test');
          });

          it('Classes from components are correctly imported inside main container', function() {
            var model = this.wrapper.add([
              { classes: ['test11', 'test12', 'test13'] },
              { classes: ['test11', 'test22', 'test22'] },
            ]);
            expect(this.gjs.editor.get('SelectorManager').getAll().length).toEqual(4);
          });

          it('Class imported into component is the same model from main container', function() {
            var model = this.wrapper.add({ classes: ['test1'] });
            var clModel = model.get('classes').at(0);
            var clModel2 = this.gjs.editor.get('SelectorManager').getAll().at(0);
            expect(clModel).toEqual(clModel2);
          });

          it('Can assign only one time the same class on selected component and the class viewer', function() {
            var model = this.wrapper.add({});
            this.gjs.editor.set('selectedComponent', model);
            this.$clm.addNewTag('test');
            this.$clm.addNewTag('test');
            expect(model.get('classes').length).toEqual(1);
            expect(model.get('classes').at(0).get('name')).toEqual('test');
            expect(this.$clm.collection.length).toEqual(1);
            expect(this.$clm.collection.at(0).get('name')).toEqual('test');
          });

          it('Removing from container removes also from selected component', function() {
            var model = this.wrapper.add({});
            this.gjs.editor.set('selectedComponent', model);
            this.$clm.addNewTag('test');
            this.$clm.getClasses().find('.tag #close').trigger('click')
            expect(model.get('classes').length).toEqual(0);
          });

          it("Trigger correctly event on target with new class add", function() {
            var spy = sinon.spy();
            var model = this.wrapper.add({});
            this.gjs.editor.set('selectedComponent', model);
            this.$clm.addNewTag('test');
            this.gjs.editor.on("targetClassAdded", spy);
            this.$clm.addNewTag('test');
            expect(spy.called).toEqual(false);
            this.$clm.addNewTag('test2');
            expect(spy.called).toEqual(true);
          });

        });

    });
  }
};
