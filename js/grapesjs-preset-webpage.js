grapesjs.plugins.add('gjs-preset-webpage', (editor, opts) => {
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
  cmdm.add('set-device-tablet', {
    run: function(editor) {
      editor.setDevice('Tablet');
    }
  });
  cmdm.add('set-device-mobile', {
    run: function(editor) {
      editor.setDevice('Mobile portrait');
    }
  });
  cmdm.add('clean-all', {
    run: function(editor, sender) {
      sender && sender.set('active',false);
      if(confirm('Are you sure to clean the canvas?')){
        var comps = editor.DomComponents.clear();
        localStorage.setItem('gjs-css', '');
        localStorage.setItem('gjs-html', '');
      }
    }
  });

  /****************** BLOCKS *************************/

  var bm = editor.BlockManager;
  bm.add('link-block', {
    label: 'Link Block',
    attributes: {class:'fa fa-link'},
    content: {
      type:'link',
      editable: false,
      droppable: true,
      style:{
        display: 'inline-block',
        padding: '5px',
        'min-height': '50px',
        'min-width': '50px'
      }
    },
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
  },{
    id: 'view-github',
    className: 'fa fa-github',
    command: 'open-github',
    attributes: { title: 'View Github Page' }
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
    id: 'deviceTablet',
    command: 'set-device-tablet',
    className: 'fa fa-tablet',
    attributes: {'title': 'Tablet'},
  },{
    id: 'deviceMobile',
    command: 'set-device-mobile',
    className: 'fa fa-mobile',
    attributes: {'title': 'Mobile'},
  }]);
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
