import ComponentView from './ComponentTextNodeView';

export default class ComponentCommentView extends ComponentView {
  _createElement() {
    return document.createComment(this.model.get('content'));
  }
}
