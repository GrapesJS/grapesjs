describe('E2E tests', () => {
  var fixtures;
  var fixture;
  var obj;
  var config;
  var editorName = 'panel-fixture';

  beforeAll(() => {
    fixtures = $('<div id="#fixtures"></div>').appendTo('body');
  });

  beforeEach(() => {
    obj = grapesjs;
    config = {
      container: '#' + editorName,
      storageManager: { autoload: 0, type: 'none' }
    };
    fixture = $('<div id="' + editorName + '"></div>');
    fixture.empty().appendTo(fixtures);
  });

  afterEach(() => {
    obj = null;
    config = null;
    fixture.remove();
  });

  afterAll(() => {
    //fixture.remove();
  });

  test('Command is correctly executed on button click', () => {
    var commandId = 'command-test';
    config.commands = {
      defaults: [
        {
          id: commandId,
          run(ed, caller) {
            ed.testValue = 'testValue';
            caller.set('active', false);
          }
        }
      ]
    };
    config.panels = {
      defaults: [
        {
          id: 'toolbar-test',
          buttons: [
            {
              id: 'button-test',
              className: 'fa fa-smile-o',
              command: commandId
            }
          ]
        }
      ]
    };
    var editor = obj.init(config);
    editor.testValue = '';
    var button = editor.Panels.getButton('toolbar-test', 'button-test');
    button.set('active', 1);
    expect(editor.testValue).toEqual('testValue');
    expect(button.get('active')).toEqual(false);
  });
});
