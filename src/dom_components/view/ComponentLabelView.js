import ComponentLinkView from './ComponentLinkView';

export default class ComponentLabelView extends ComponentLinkView {
  tagName = 'span'; // Avoid Firefox bug with label editing #2332
}
