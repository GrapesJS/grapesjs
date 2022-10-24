import { View } from '../../common';
import EditorModel from '../../editor/model/Editor';
import html from '../../utils/html';
import Category from '../model/Category';

export interface CategoryViewConfig {
  em: EditorModel;
  pStylePrefix?: string;
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
  blocksEl?: HTMLElement;

  events() {
    return {
      'click [data-title]': 'toggle',
    };
  }

  template({ pfx, label }: { pfx: string; label: string }) {
    return html`
      <div class="${pfx}title" data-title>
        <i class="${pfx}caret-icon"></i>
        ${label}
      </div>
      <div class="${pfx}blocks-c"></div>
    `;
  }

  // @ts-ignore
  attributes() {
    return this.model.get('attributes') || {};
  }

  constructor(o: any, config: CategoryViewConfig) {
    super(o);
    this.config = config;
    const pfx = config.pStylePrefix || '';
    this.em = config.em;
    this.pfx = pfx;
    this.caretR = 'fa fa-caret-right';
    this.caretD = 'fa fa-caret-down';
    this.iconClass = `${pfx}caret-icon`;
    this.activeClass = `${pfx}open`;
    this.className = `${pfx}block-category`;
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
    this.getBlocksEl()!.style.display = '';
  }

  close() {
    this.$el.removeClass(this.activeClass);
    this.getIconEl()!.className = `${this.iconClass} ${this.caretR}`;
    this.getBlocksEl()!.style.display = 'none';
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

  getBlocksEl() {
    if (!this.blocksEl) {
      this.blocksEl = this.el.querySelector(`.${this.pfx}blocks-c`)!;
    }

    return this.blocksEl;
  }

  append(el: HTMLElement) {
    this.getBlocksEl().appendChild(el);
  }

  render() {
    const { em, el, $el, model, pfx } = this;
    const label = em.t(`blockManager.categories.${model.id}`) || model.get('label');
    el.innerHTML = this.template({ pfx, label });
    $el.addClass(this.className!);
    $el.css({ order: model.get('order')! });
    this.updateVisibility();

    return this;
  }
}
