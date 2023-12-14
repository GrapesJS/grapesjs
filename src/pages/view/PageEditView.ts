import { View } from '../../common';
import TraitNumberView, { TraitNumberUnitView } from '../../common/traits/view/TraitNumberView';
import TraitTextView from '../../common/traits/view/TraitTextView';
import EditorModel from '../../editor/model/Editor';
import Page from '../../pages/model/Page';

export interface PageViewConfig {
  em?: EditorModel;
  pStylePrefix?: string;
}

export default class PageEditView extends View<Page> {
  className: string;

  highlightedClass = 'gjs-three-bg';

  render() {
    const { em } = this;
    this.$el.empty();
    this.$el.attr('class', this.className);
    if (this.model) {
      let input = new TraitNumberView('name', this.model, { em, name: 'name', min: 0 });
      this.$el.append(input.render().el);

      let input3 = new TraitNumberUnitView('name', this.model, { em, name: 'name', min: 0, units: ['px', '%'] });
      this.$el.append(input3.render().el);
      let input2 = new TraitTextView('name', this.model, { em, name: 'route' });
      this.$el.append(input2.render().el);
    }
    return this;
  }

  events() {
    return {
      click: () => this.trigger('onClick', this),
    };
  }

  constructor(model: Page, config: PageViewConfig) {
    super({ model });
    this.config = config;

    const { pfx, ppfx } = this;
    this.className = `${ppfx}layer no-select ${pfx}two-color`;
  }

  changePage(page: Page) {
    this.model = page;
    this.render();
    console.log('changePage');
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

  get page(): Page | undefined {
    return this.model;
  }
}
