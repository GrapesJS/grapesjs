import { isArray } from 'underscore';
import { Collection, Model } from '../../common';
import Component from '../../dom_components/model/Component';

export class Selectable extends Model {}

export default class Selected extends Collection<Selectable> {
  getByComponent(component: Component) {
    return this.filter(s => this.getComponent(s) === component)[0];
  }

  addComponent(component: Component, opts: any) {
    const toAdd = (isArray(component) ? component : [component])
      .filter(c => !this.hasComponent(c))
      .map(component => new Selectable({ component }))[0];
    return this.push(toAdd, opts);
  }

  getComponent(model: Selectable): Component {
    return model.get('component');
  }

  hasComponent(component: Component) {
    const model = this.getByComponent(component);
    return model && this.contains(model);
  }

  lastComponent() {
    const last = this.last();
    return last && this.getComponent(last);
  }

  allComponents() {
    return this.map(s => this.getComponent(s)).filter(i => i);
  }

  removeComponent(component: Component | Component[], opts: any) {
    const toRemove = (isArray(component) ? component : [component]).map(c => this.getByComponent(c));
    return this.remove(toRemove, opts);
  }
}
