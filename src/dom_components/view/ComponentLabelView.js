import ComponentLinkView from './ComponentLinkView';

export default ComponentLinkView.extend({
  tagName: 'span' // Avoid Firefox bug with label editing #2332
});
