import { View } from '../common';
import EditorModel from '../editor/model/Editor';
import html from '../utils/html';
import Category from './ModuleCategory';

export interface CategoryViewConfig {
  em: EditorModel;
  pStylePrefix?: string;
  stylePrefix?: string;
}

export default class CategoryView extends View<Category> {
  em: EditorModel;
  config: CategoryViewConfig;
  pfx: string;
  caretR: string;
  caretD: string;
  iconClass: string;
  activeClass: string;
  iconEl?: HTMLElement;
  typeEl?: HTMLElement;
  catName: string;

  events() {
    return {
      'click [data-title]': 'toggle',
    };
  }

  template({ pfx, label, catName }: { pfx: string; label: string; catName: string }) {
    return html`
      <div class="${pfx}title" data-title>
        <i class="${pfx}caret-icon"></i>
        ${label}
      </div>
      <div class="${pfx}${catName}s-c"></div>
    `;
  }

  /** @ts-ignore */
  attributes() {
    return this.model.get('attributes') || {};
  }

  constructor(o: any, config: CategoryViewConfig, catName: string) {
    super(o);
    this.config = config;
    const pfx = config.pStylePrefix || '';
    this.em = config.em;
    this.catName = catName;
    this.pfx = pfx;
    this.caretR = 'fa fa-caret-right';
    this.caretD = 'fa fa-caret-down';
    this.iconClass = `${pfx}caret-icon`;
    this.activeClass = `${pfx}open`;
    this.className = `${pfx}${catName}-category`;
    this.listenTo(this.model, 'change:open', this.updateVisibility);
    this.model.view = this;
  }

  updateVisibility() {
    if (this.model.get('open')) this.open();
    else this.close();
  }

  open() {
    this.$el.addClass(this.activeClass);
    this.getIconEl()!.className = `${this.iconClass} ${this.caretD}`;
    this.getTypeEl()!.style.display = '';
  }

  close() {
    this.$el.removeClass(this.activeClass);
    this.getIconEl()!.className = `${this.iconClass} ${this.caretR}`;
    this.getTypeEl()!.style.display = 'none';
  }

  toggle() {
    var model = this.model;
    model.set('open', !model.get('open'));
  }

  getIconEl() {
    if (!this.iconEl) {
      this.iconEl = this.el.querySelector(`.${this.iconClass}`)!;
    }

    return this.iconEl;
  }

  getTypeEl() {
    if (!this.typeEl) {
      this.typeEl = this.el.querySelector(`.${this.pfx}${this.catName}s-c`)!;
    }

    return this.typeEl;
  }

  append(el: HTMLElement) {
    this.getTypeEl().appendChild(el);
  }

  render() {
    const { em, el, $el, model, pfx, catName } = this;
    const label = em.t(`${catName}Manager.categories.${model.id}`) || model.get('label');
    el.innerHTML = this.template({ pfx, label, catName });
    $el.addClass(this.className!);
    $el.css({ order: model.get('order')! });
    this.updateVisibility();

    return this;
  }
}
