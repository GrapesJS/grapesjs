
define(['GrapesJS'],
  function(GrapesJS) {

    return {
      run : function(){

          describe('E2E tests', function() {

            var fixtures;
            var fixture;
            var obj;
            var editorName = 'panel-fixture';

            before(function () {
              fixtures  = $("#fixtures");
            });

            beforeEach(function () {
              obj = GrapesJS;
              config = {
                container: '#' + editorName,
                storage: { autoload: 0, type:'none' },
              };
              fixture   = $('<div id="' + editorName + '"></div>');
              fixture.empty().appendTo(fixtures);
            });

            afterEach(function () {
              delete obj;
              delete config;
              fixture.remove();
            });

            after(function () {
              fixture.remove();
            });

            it('Command is correctly executed on button click', function() {
              var commandId = 'command-test';
              config.commands = {
                defaults: [{
                  id: commandId,
                  run: function(ed, caller){
                    ed.testValue = 'testValue';
                    caller.set('active', false);
                  }
                }]
              };
              config.panels = {
                defaults  : [{
                  id      : 'toolbar-test',
                  buttons : [{
                      id          : 'button-test',
                      className   : 'fa fa-smile-o',
                      command     : commandId,
                  }],
                }],
              };
              var editor = obj.init(config);
              editor.testValue = '';
              var button = editor.Panels.getButton('toolbar-test', 'button-test');
              button.set('active', 1);
              editor.testValue.should.equal('testValue');
              button.get('active').should.equal(false);
            });

        });

      }

    };

});