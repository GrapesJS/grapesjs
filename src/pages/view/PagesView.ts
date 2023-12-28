import PagesManager from '../../pages';
import { $, View } from '../../common';
import EditorModel from '../../editor/model/Editor';
import Page from '../model/Page';
import Pages from '../model/Pages';
import PageView from './PageView';

export interface PagesViewConfig {
  em: EditorModel;
  pStylePrefix?: string;
}

export default class PagesView extends View<Page> {
  em: EditorModel;
  config: PagesViewConfig;
  ppfx: string;

  selectedView?: PageView;

  events() {
    const { buttonAddId, buttonRemoveId } = this;
    const buttonAddEvent = 'click #' + buttonAddId;
    const buttonRemoveEvent = 'click #' + buttonRemoveId;
    return {
      [buttonAddEvent]: this.__addPage,
      [buttonRemoveEvent]: this.__removePage,
    };
  }

  constructor(opts: any, config: PagesViewConfig) {
    super(opts);

    this.config = config || {};
    const ppfx = this.config.pStylePrefix || '';
    this.ppfx = ppfx;
    const coll = this.collection;
    this.listenTo(coll, 'reset', this.render);
    this.listenTo(coll, 'remove', this.render);
    this.em = this.config.em;
  }

  __getModule(): PagesManager {
    return this.em.Pages;
  }

  get buttonAddId() {
    const { ppfx } = this;
    return ppfx + 'button-add';
  }

  get buttonRemoveId() {
    const { ppfx } = this;
    return ppfx + 'button-remove';
  }

  private __addPage() {
    const { em } = this;
    this.collection.add(new Page({}, { em }));
    this.render();
  }

  __removePage() {
    if (this.selectedView) {
      this.collection.remove(this.selectedView.model);
    }
  }

  /**
   * Add new model to the collection
   * @param {Model} model
   * @private
   * */
  addTo(model: Page) {
    this.collection.add(model);
  }

  /**
   * Render new model inside the view
   * @param {Model} model
   * @param {Object} fragment Fragment collection
   * @private
   * */
  add(model: Page, fragment: DocumentFragment) {
    const { config } = this;
    const view = new PageView(
      {
        model,
      },
      config
    );
    const rendered = view.render().el;
    if (this.em.Pages.getSelected()?.id == model.id) {
      view.setHighlighted(true);
      this.selectedView = view;
    }

    view.on('onClick', this.selectedHandler, this);

    fragment.appendChild(rendered);
  }

  selectedHandler(view: PageView) {
    this.em.Pages.select(view.model);
    this.selectedView?.setHighlighted(false);
    this.trigger('selected', view.model);
    this.selectedView = view;
    this.selectedView.setHighlighted(true);
  }

  getCommandsNav() {
    const { buttonAddId, buttonRemoveId } = this;
    return $(`<div data-val-id="">
    <div><button id="${buttonAddId}">Add page</button></div>
    <div><button id="${buttonRemoveId}">Delete page</button></div>
    </div>`);
  }

  render() {
    this.$el.empty();
    let container = $('<div class=""></div>');
    container.className = 'gps-block';
    container.append(this.getCommandsNav());

    var frag = document.createDocumentFragment();
    this.collection.each(model => {
      this.add(model, frag);
    }, this);
    container.append(frag);

    this.$el.append(container);
    this.setElement(this.$el);
    return this;
  }
}
