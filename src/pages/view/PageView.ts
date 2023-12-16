import { isFunction } from 'underscore';
import { View } from '../../common';
import EditorModel from '../../editor/model/Editor';
import { hasDnd } from '../../utils/mixins';
import Page from '../../pages/model/Page';
import TraitTextView from '../../common/traits/view/TraitTextView';

export interface PageViewConfig {
  em?: EditorModel;
  pStylePrefix?: string;
}

export default class PageView extends View<Page> {
  className: string;

  highlightedClass = 'gjs-three-bg';

  render() {
    const { em, pfx, ppfx, model } = this;
    this.$el.attr('class', this.className);
    let input = new TraitTextView(em).setTarget('name', this.model, { changeProp: true });
    this.$el.append(input.render().el);
    return this;
  }
  events() {
    return {
      click: () => this.trigger('onClick', this),
    };
  }

  constructor(opt: any, config: PageViewConfig) {
    super(opt);
    this.config = config;
    const { model, pfx, ppfx } = this;
    const type = model.get('type') || 'default';
    this.className = `${ppfx}layer ${ppfx}layer__t-${type} no-select ${pfx}two-color`;
  }

  public get em(): EditorModel {
    return this.config.em;
  }

  public get ppfx(): string {
    return this.em.getConfig().stylePrefix!;
  }

  public get pfx(): string {
    return this.config.stylePrefix;
  }

  setHighlighted(status: boolean) {
    status ? this.$el.addClass(this.highlightedClass) : this.$el.removeClass(this.highlightedClass);
  }

  config: any;

  get page() {
    return this.model;
  }
}
