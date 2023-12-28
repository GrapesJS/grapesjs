import { View } from '../../common';
import TraitButtonView from '../../common/traits/view/TraitButtonView';
import TraitCheckboxView from '../../common/traits/view/TraitCheckboxView';
import TraitColorView from '../../common/traits/view/TraitColorView';
import { TraitNumberView, TraitNumberUnitView } from '../../common/traits/view/TraitNumberView';
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
      let input = new TraitNumberView(em, { min: 0 });
      input.setTarget('name', this.model, { changeProp: true });
      this.$el.append(input.render().el);

      let input3 = new TraitNumberUnitView(em, { min: 0, units: ['px', '%'] });
      input3.setTarget('name', this.model, { changeProp: true });
      this.$el.append(input3.render().el);

      this.$el.append(
        new TraitSelectView(em, { options: ['px', '%'] }).setTarget('name', this.model, { changeProp: true }).render()
          .el
      );

      this.$el.append(new TraitCheckboxView(em).setTarget('name', this.model, { changeProp: true }).render().el);

      this.$el.append(
        new TraitButtonView(em, {
          text: 'Ok',
          command: () => {
            console.log('click');
          },
          full: true,
        })
          .setTarget('name', this.model, { changeProp: true })
          .render().el
      );
      this.$el.append(new TraitColorView(em, {}).setTarget('name', this.model, { changeProp: true }).render().el);

      let input2 = new TraitTextView(em, {}).setTarget('route', this.model, { changeProp: true });
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
