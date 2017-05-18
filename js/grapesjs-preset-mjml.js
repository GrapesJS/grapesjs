grapesjs.plugins.add('gjs-preset-mjml', (editor, opts) => {
  var opt = opts || {};
  var config = editor.getConfig();

  config.showDevices = 0;

  var updateTooltip = function(coll, pos) {
    coll.each(function(item) {
      var attrs = item.get('attributes');
      attrs['data-tooltip-pos'] = pos || 'bottom';
      item.set('attributes', attrs);
    });
  }


  /****************** COMMANDS *************************/

  var cmdm = editor.Commands;
  cmdm.add('undo', {
    run: function(editor, sender) {
      sender.set('active', 0);
      editor.UndoManager.undo(1);
    }
  });
  cmdm.add('redo', {
    run: function(editor, sender) {
      sender.set('active', 0);
      editor.UndoManager.redo(1);
    }
  });
  cmdm.add('set-device-desktop', {
    run: function(editor) {
      editor.setDevice('Desktop');
    }
  });
  cmdm.add('set-device-mobile', {
    run: function(editor) {
      editor.setDevice('Mobile');
    }
  });
  cmdm.add('clean-all', {
    run: function(editor, sender) {
      sender && sender.set('active',false);
      if (confirm('Are you sure you want to clean the canvas?')) {
        editor.setComponents('<mj-container><mj-section><mj-column>'+
          '<mj-text>Start from here</mj-text></mj-column></mj-section></mj-container>');
        localStorage.setItem('gjs-mjml-css', '');
        localStorage.setItem('gjs-mjml-html', '');
      }
    }
  });

  /****************** BUTTONS *************************/

  var pnm = editor.Panels;
  pnm.addButton('options', [{
    id: 'undo',
    className: 'fa fa-undo icon-undo',
    command: 'undo',
    attributes: { title: 'Undo (CTRL/CMD + Z)'}
  },{
    id: 'redo',
    className: 'fa fa-repeat icon-redo',
    command: 'redo',
    attributes: { title: 'Redo (CTRL/CMD + SHIFT + Z)' }
  },{
    id: 'clean-all',
    className: 'fa fa-trash icon-blank',
    command: 'clean-all',
    attributes: { title: 'Empty canvas' }
  }]);

  // Add devices buttons
  var panelDevices = pnm.addPanel({id: 'devices-c'});
  var deviceBtns = panelDevices.get('buttons');
  deviceBtns.add([{
    id: 'deviceDesktop',
    command: 'set-device-desktop',
    className: 'fa fa-desktop',
    attributes: {'title': 'Desktop'},
    active: 1,
  },{
    id: 'deviceMobile',
    command: 'set-device-mobile',
    className: 'fa fa-mobile',
    attributes: {'title': 'Mobile'},
  }]);

  // Remove preview and code button
  let prvBtn = pnm.addButton('options', 'preview');
  let optPanel = pnm.getPanel('options');
  let cmdBtns = optPanel.get('buttons');
  prvBtn && cmdBtns.remove(prvBtn);

  updateTooltip(deviceBtns);
  updateTooltip(pnm.getPanel('options').get('buttons'));
  updateTooltip(pnm.getPanel('options').get('buttons'));
  updateTooltip(pnm.getPanel('views').get('buttons'));



  /****************** EVENTS *************************/

  // On component change show the Style Manager
  editor.on('change:selectedComponent', function() {
    var openLayersBtn = editor.Panels.getButton('views', 'open-layers');

    // Don't switch when the Layer Manager is on or
    // there is no selected component
    if((!openLayersBtn || !openLayersBtn.get('active')) &&
      editor.editor.get('selectedComponent')) {
      var openSmBtn = editor.Panels.getButton('views', 'open-sm');
      openSmBtn && openSmBtn.set('active', 1);
    }
  });

  // Do stuff on load
  editor.on('load', function() {
    // Open block manager
    var openBlocksBtn = editor.Panels.getButton('views', 'open-blocks');
    openBlocksBtn && openBlocksBtn.set('active', 1);
  });

});
