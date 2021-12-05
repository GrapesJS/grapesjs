export default (editor, config) => {
  const sm = editor.StyleManager;
  const csm = config.customStyleManager;

  sm.getSectors().reset(csm && csm.length ? csm : [{
    name: config.textGeneral,
    open: false,
    buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
  },{
    name: config.textLayout,
    open: false,
    buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
  },{
    name: config.textTypography,
    open: false,
    buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-shadow'],
    properties: [{
      property: 'text-align',
      list: [
          { value: 'left', className: 'fas fa-align-left' },
          { value: 'center', className: 'fas fa-align-center'  },
          { value: 'right', className: 'fas fa-align-right' },
          { value: 'justify', className: 'fas fa-align-justify' },
      ],
    }]
  },{
    name: config.textDecorations,
    open: false,
    buildProps: ['border-radius-c', 'background-color', 'border-radius', 'border', 'box-shadow', 'background'],
  },{
    name: config.textExtra,
    open: false,
    buildProps: ['transition', 'perspective', 'transform'],
  }]);
}
