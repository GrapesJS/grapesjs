export default (editor, opts = {}) => {
  const domc = editor.DomComponents;

  domc.addType('MY-COMPONENT', {
    model: {
      defaults: {
        // Default props
      },
    },
    view: {

    },
  });
};
