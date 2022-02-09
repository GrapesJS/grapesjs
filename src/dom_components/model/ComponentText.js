import Component from './Component';

export default class ComponentText extends Component {
  /**
   * This method is called once the content of the text is reset.
   */
  onContentReset(components, opts) {
    const cmps = components || this.components();

    cmps.forEach(model => {
      const textable = !!model.get('textable');
      const isBaseType = ['text', 'default', ''].some(type => model.is(type));
      const selectable = !isBaseType || textable;
      model.set(
        {
          _innertext: model.get('_innertext') ? true : !selectable,
          // editable: selectable && model.get('editable'),
          // selectable: selectable,
          // hoverable: selectable,
          // draggable: textable,
          // highlightable: 0,
          // copyable: textable,
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
