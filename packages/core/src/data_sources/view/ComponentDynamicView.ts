import ComponentView from '../../dom_components/view/ComponentView';
import EditorModel from '../../editor/model/Editor';
import ComponentConditionalVariable from '../model/conditional_variables/ComponentConditionalVariable';

export default class DynamicView extends ComponentView<ComponentConditionalVariable> {
  initialize(opt: any = {}) {
    const model = this.model;
    const config = opt.config || {};
    const em: EditorModel = config.em;
    const viewId = this.model.dataCondition.getDataValue()?.type || 'default';
    const view = new (em.Components.getType(viewId).view)(opt);

    return view;
  }
}
