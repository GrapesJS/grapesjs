
define(
	function(require) {

    return {
      run : function(){
          describe('E2E tests', function() {

            /**
             * Create tags viewer
             * @param  {Object} ctx
             */
            var instClassTagViewer = function(ctx){
              var $clm;
              var clm = ctx.gjs.editor.get('ClassManager');
              clm.config.target = ctx.gjs.editor;
              if(clm){
                $clm = new clm.ClassTagsView({
                  collection: new clm.ClassTags([]),
                  config: clm.config,
                }).render();
                ctx.$fixture.append($clm.el);
              }
              return $clm;
            };

            before(function () {
              this.$fixtures  = $("#fixtures");
              this.$fixture   = $('<div id="ClassManager-fixture"></div>');
            });

            beforeEach(function () {
              var Grapes = require('editor/main');
              this.gjs = new Grapes({
                stylePrefix: '',
                storageType: 'none',
                storageManager: {
                  storageType: 'none',
                },
                assetManager: {
                  storageType: 'none',
                },
                container: '#ClassManager-fixture',
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



            it('Assign correctly new class to component', function() {
              var wrp = this.gjs.editor.get('Components').getWrapper().get('components');
              var model = wrp.add({});
              model.get('classes').length.should.equal(0);

              // Init Class Manager and set editor as a target
              var $clm = instClassTagViewer(this);

              // Select element
              this.gjs.editor.set('selectedComponent', model);

              $clm.addNewTag('test');

              model.get('classes').length.should.equal(1);
              model.get('classes').at(0).get('name').should.equal('test');

            });



            it('Classes from components are correctly imported inside main container', function() {
              var wrp = this.gjs.editor.get('Components').getWrapper().get('components');
              var model = wrp.add([
                { classes: ['test11', 'test12', 'test13'] },
                { classes: ['test11', 'test22', 'test22'] },
              ]);
              this.gjs.editor.get('ClassManager').getClasses().length.should.equal(4);
            });



            it('Class imported into component is the same model from main container', function() {
              var wrp = this.gjs.editor.get('Components').getWrapper().get('components');
              var model = wrp.add({
                classes: ['test1']
              });
              var clModel = model.get('classes').at(0);
              var clModel2 = this.gjs.editor.get('ClassManager').getClasses().at(0);
              clModel.should.deep.equal(clModel2);
            });



            it('Can assign only one time the same class on selected component and the class viewer', function() {
              var wrp = this.gjs.editor.get('Components').getWrapper().get('components');
              var model = wrp.add({});

              var $clm = instClassTagViewer(this);
              // Select element
              this.gjs.editor.set('selectedComponent', model);

              $clm.addNewTag('test');
              $clm.addNewTag('test');

              model.get('classes').length.should.equal(1);
              model.get('classes').at(0).get('name').should.equal('test');

              $clm.collection.length.should.equal(1);
              $clm.collection.at(0).get('name').should.equal('test');
            });

            it('Removing from container removes also from selected component', function() {

              var wrp = this.gjs.editor.get('Components').getWrapper().get('components');
              var model = wrp.add({});
              var $clm = instClassTagViewer(this);
              this.gjs.editor.set('selectedComponent', model);
              $clm.addNewTag('test');
              $clm.collection.at(0).destroy();

              model.get('classes').length.should.equal(0);

            });

        });
      }
    };

});