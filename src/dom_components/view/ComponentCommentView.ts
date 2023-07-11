import ComponentTextNodeView from './ComponentTextNodeView';

export default class ComponentCommentView extends ComponentTextNodeView {
  _createElement() {
    return document.createComment(this.model.content) as Text;
  }
}
