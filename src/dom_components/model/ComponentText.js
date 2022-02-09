import Component from './Component';

export default class ComponentText extends Component {
  /**
   * This method is called once the content of the text is reset.
   */
  onContentReset(components, opts) {
    const cmps = components || this.components();

    cmps.forEach(model => {
      const textable = !!model.get('textable');
      model.set(
        {
          ...(!textable && { toolbar: '' }),
        },
        opts
      );
      this.onContentReset(model.components(), opts);
    });
  }
}

ComponentText.prototype.defaults = {
  ...Component.getDefaults(),
  type: 'text',
  droppable: false,
  editable: true,
  __text: true,
};
