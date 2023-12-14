import { View } from '../../common';
import TraitButtonView from '../../common/traits/view/TraitButtonView';
import TraitCheckboxView from '../../common/traits/view/TraitCheckboxView';
import TraitColorView from '../../common/traits/view/TraitColorView';
import TraitNumberView, { TraitNumberUnitView } from '../../common/traits/view/TraitNumberView';
import TraitSelectView from '../../common/traits/view/TraitSelectView';
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

      this.$el.append(new TraitSelectView('name', this.model, { em, name: 'name', options: ['px', '%'] }).render().el);

      this.$el.append(new TraitCheckboxView('name', this.model, { em, name: 'name' }).render().el);

      this.$el.append(
        new TraitButtonView('name', this.model, {
          em,
          name: 'name',
          text: 'Ok',
          command: () => {
            console.log('click');
          },
        }).render().el
      );
      this.$el.append(new TraitColorView('name', this.model, { em, name: 'name' }).render().el);

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
