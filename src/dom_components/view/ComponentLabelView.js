import ComponentLinkView from './ComponentLinkView';

export default class ComponentLabelView extends ComponentLinkView {
  tagName() {
    return 'span';
  } // Avoid Firefox bug with label editing #2332
}
