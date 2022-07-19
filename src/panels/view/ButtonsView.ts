import { result } from 'underscore';
import { View } from '../../abstract';
import Button from '../model/Button';
import Buttons from '../model/Buttons';
import ButtonView from './ButtonView';

export default class ButtonsView extends View<Buttons> {
  constructor(collection: Buttons) {
    super({ collection });
    this.listenTo(this.collection, 'add', this.addTo);
    this.listenTo(this.collection, 'reset remove', this.render);
    this.className = this.pfx + 'buttons';
  }

  /**
   * Add to collection
   * @param Object Model
   *
   * @return Object
   * */
  private addTo(model: Button) {
    this.addToCollection(model);
  }

  /**
   * Add new object to collection
   * @param  Object  Model
   * @param  Object   Fragment collection
   *
   * @return Object Object created
   * */
  private addToCollection(model: Button, fragmentEl?: DocumentFragment) {
    const fragment = fragmentEl || null;
    const el = model.get('el');
    const view = new ButtonView({
      el,
      model,
    });
    const rendered = view.render().el;

    if (fragment) {
      fragment.appendChild(rendered);
    } else {
      this.$el.append(rendered);
    }

    return rendered;
  }

  public render() {
    var fragment = document.createDocumentFragment();
    this.$el.empty();

    this.collection.each(model => this.addToCollection(model, fragment));

    this.$el.append(fragment);
    this.$el.attr('class', result(this, 'className'));
    return this;
  }
}
