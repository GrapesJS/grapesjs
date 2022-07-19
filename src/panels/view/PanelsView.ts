import { View } from '../../abstract';
import Panel from '../model/Panel';
import Panels from '../model/Panels';
import PanelView from './PanelView';

export default class PanelsView extends View<Panels> {
  constructor(target: Panels) {
    super({ collection: target });
    this.listenTo(target, 'add', this.addTo);
    this.listenTo(target, 'reset', this.render);
    this.listenTo(target, 'remove', this.onRemove);
    this.className = this.pfx + 'panels';
  }

  private onRemove(model: Panel) {
    const view = model.view;
    view && view.remove();
  }

  /**
   * Add to collection
   * @param Object Model
   *
   * @return Object
   * @private
   * */
  private addTo(model: Panel) {
    this.addToCollection(model);
  }

  /**
   * Add new object to collection
   * @param  Object  Model
   * @param  Object   Fragment collection
   * @param  integer  Index of append
   *
   * @return Object Object created
   * @private
   * */
  private addToCollection(model: Panel, fragmentEl?: DocumentFragment) {
    const fragment = fragmentEl || null;
    const config = this.config;
    const el = model.get('el');
    const view = new PanelView(model);
    const rendered = view.render().el;
    const appendTo = model.get('appendTo');

    // Do nothing if the panel was requested to be another element
    if (el) {
    } else if (appendTo) {
      var appendEl = document.querySelector(appendTo);
      appendEl.appendChild(rendered);
    } else {
      if (fragment) {
        fragment.appendChild(rendered);
      } else {
        this.$el.append(rendered);
      }
    }

    view.initResize();
    return rendered;
  }

  public render() {
    const $el = this.$el;
    const frag = document.createDocumentFragment();
    $el.empty();
    this.collection.each(model => this.addToCollection(model, frag));
    $el.append(frag);
    $el.attr('class', this.className);
    return this;
  }
}
