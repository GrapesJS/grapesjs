import {
  cmdImport,
  cmdDeviceDesktop,
  cmdDeviceTablet,
  cmdDeviceMobile,
  cmdClear
} from './../consts';

export default (editor, config) => {
  const pn = editor.Panels;
  const eConfig = editor.getConfig();
  const crc = 'create-comp';
  const mvc = 'move-comp';
  const swv = 'sw-visibility';
  const expt = 'export-template';
  const osm = 'open-sm';
  const otm = 'open-tm';
  const ola = 'open-layers';
  const obl = 'open-blocks';
  const ful = 'fullscreen';
  const prv = 'preview';

  eConfig.showDevices = 0;

  pn.getPanels().reset([{
    id: 'commands',
    buttons: [{}],
  },{
    id: 'options',
    buttons: [{
      id: swv,
      command: swv,
      context: swv,
      className: 'far fa-square',
    },{
      id: prv,
      context: prv,
      command: e => e.runCommand(prv),
      className: 'fas fa-eye',
    },{
      id: ful,
      command: ful,
      context: ful,
      className: 'fas fa-arrows-alt',
    },{
      id: expt,
      className: 'fas fa-code',
      command: e => e.runCommand(expt),
    },{
      id: 'undo',
      className: 'fas fa-undo',
      command: e => e.runCommand('core:undo'),
    },{
      id: 'redo',
      className: 'fas fa-redo',
      command: e => e.runCommand('core:redo'),
    },{
      id: cmdImport,
      className: 'fas fa-download',
      command: e => e.runCommand(cmdImport),
    },{
      id: cmdClear,
      className: 'fas fa-trash',
      command: e => e.runCommand(cmdClear),
    }],
  },{
    id: 'views',
    buttons  : [{
      id: osm,
      command: osm,
      active: true,
      className: 'fas fa-paint-brush',
    },{
      id: otm,
      command: otm,
      className: 'fas fa-cog',
    },{
      id: ola,
      command: ola,
      className: 'fas fa-bars',
    },{
      id: obl,
      command: obl,
      className: 'fas fa-th-large',
    }],
  }]);

  // Add devices buttons
  const panelDevices = pn.addPanel({id: 'devices-c'});
  panelDevices.get('buttons').add([{
    id: cmdDeviceDesktop,
    command: cmdDeviceDesktop,
    className: 'fas fa-desktop',
    active: 1,
  },{
    id: cmdDeviceTablet,
    command: cmdDeviceTablet,
    className: 'fas fa-tablet-alt',
  },{
    id: cmdDeviceMobile,
    command: cmdDeviceMobile,
    className: 'fas fa-mobile-alt',
  }]);

  const openBl = pn.getButton('views', obl);
  editor.on('load', () => openBl && openBl.set('active', 1));

  // On component change show the Style Manager
  config.showStylesOnChange && editor.on('component:selected', () => {
    const openSmBtn = pn.getButton('views', osm);
    const openLayersBtn = pn.getButton('views', ola);

    // Don't switch when the Layer Manager is on or
    // there is no selected component
    if ((!openLayersBtn || !openLayersBtn.get('active')) && editor.getSelected()) {
      openSmBtn && openSmBtn.set('active', 1);
    }
  });
}
