import { Model, $ } from '../..';
import EditorModel from '../../../editor/model/Editor';
import InputFactory from '..';
import TraitView, { TraitViewOpts } from './TraitView';
import { isArray, isUndefined, times } from 'underscore';
import TraitRoot from '../model/TraitRoot';
import TraitObjectItem from '../model/TraitObjectItem';
import Trait from '../model/Trait';
import TraitFactory from '../model/TraitFactory';
import TraitListItem from '../model/TraitListItem';
import TraitObject from '../model/TraitObject';
import TraitList from '../model/TraitList';
import TraitListUnique from '../model/TraitListUnique';
import TraitsView from './TraitsView';

export interface TraitListUniqueViewOpts<T extends string = 'object'> extends TraitViewOpts<T> {
  traits: any[] | any;
}

export default class TraitListUniqueView extends TraitsView<TraitListUnique> {
  protected type = 'list';
  templates: any[];
  private toolbarEl?: HTMLDivElement;
  private itemsEl?: JQuery<HTMLDivElement>[];
  private selectedEl?: JQuery<HTMLDivElement>;
  protected traitOps?: any;
  events() {
    return {
      'click [addButton]': this.addItem,
      'click [removeButton]': this.removeItem,
      'click [data-item-title]': this.select,
    };
  }

  private select(e?: any) {
    e?.stopPropagation();
    e?.preventDefault();
    const { model, ppfx, selectedEl } = this;
    // model.setOpen(!model.get('open'));
    this.itemsEl?.forEach(el => {
      el.find('.data-item').get(0)!.style.display = 'none';
    });
    if (!isUndefined(e)) {
      var selected = $(e.target).closest(`.${ppfx}item-title`).parent().find('.data-item');
      this.selectedEl = selected;
      selected.get(0)!.style.display = '';
    } else if (!isUndefined(selectedEl)) {
      selectedEl.get(0)!.style.display = '';
    }
    // $el[isOpen ? 'addClass' : 'removeClass'](`${pfx}open`);
    // this.getPropertiesEl().style.display = isOpen ? '' : 'none';
  }

  constructor(em: EditorModel, opts: TraitListUniqueViewOpts) {
    super(em, { ...opts });
    this.templates = opts.traits;
  }

  get children() {
    return this.target.children as TraitObjectItem[];
  }

  get editable() {
    return this.target.opts.editable ?? true;
  }

  private addItem(e: any) {
    e.preventDefault();
    const name = this.$el.find('[variableName]').val() as any;
    this.target.add(name);
    // this.render();
  }

  private removeItem(e: any) {
    e.preventDefault();
    const { value } = this.target;
    const name = this.selectedEl?.attr('item-id') as any;
    this.target.remove(name);
    // this.render();
  }

  renderToolbar() {
    if (!this.toolbarEl) {
      let el = document.createElement('div');
      el.append(document.createElement('button'));
      let tmpl = `<div class="">
      <input type="$text" variableName/>
      <button addButton> Add </button>
      <button removeButton> Remove </button>
    </div>`;
      this.toolbarEl = $(tmpl).get(0);
    }
    return this.toolbarEl!;
  }

  // onItemRender(e: any) {
  //   console.log("setValueFromModellsadkfj;lkasdj;flk", e)
  //   console.log("setValueFromModellsadkfj;lkasdj;flk", this.itemsEl?.map(t =>t.get(0)), this.items)
  //   this.render()
  // }

  renderItem(view: TraitView) {
    const { em, ppfx } = this;
    const icons = em?.getConfig().icons;
    const iconCaret = icons?.caret || '';

    // view.on('all', this.onItemRender, this);
    var itemEl = document.createElement('div');
    const itemTitle = view.target.name;
    itemEl.innerHTML = `
    <div class="${ppfx}item-title" data-item-title>
        <div class="${ppfx}caret">${iconCaret}</div>
        <div class="${ppfx}label">${itemTitle}</div>
    </div>
    `;
    // <div class="${ppfx}label">${label}</div>
    console.log(itemEl);
    var itemDataEl = document.createElement('div');
    itemDataEl.className = 'data-item';
    itemDataEl.setAttribute('item-id', view.target.name);
    $(itemDataEl).append(view.$el);
    console.log(itemEl);

    const $itemEl = $(itemEl);
    $itemEl.append(itemDataEl);
    return $itemEl;
  }

  renderTraits(items: TraitView[]) {
    const { $el, pfx, ppfx, name, type, className } = this;
    const hasLabel = this.hasLabel();
    const cls = `${pfx}trait`;
    var frag = document.createDocumentFragment();
    console.log('aaa', 'render');
    this.$el.empty();
    this.itemsEl = items.map(view => this.renderItem(view));
    this.itemsEl?.forEach(el => frag.appendChild(el.get(0)!));
    console.log(this.itemsEl);
    let itemsEl = document.createElement('div');
    itemsEl.className = `${ppfx}field-${type}-items`;
    itemsEl.append(frag);
    // el.className += model.isFull() ? ` ${className}--full` : '';
    let tmpl = `<div class="${cls} ${cls}--${type}">
    ${hasLabel ? `<div class="${ppfx}label" data-label></div>` : ''}
    <div class="${ppfx}field-wrp ${ppfx}field-wrp--${type} gjs-trt-trait--full" data-input>

    </div>
  </div>`;
    this.$el.empty().append(tmpl);
    const dataInput = this.$el.find('[data-input]');
    if (this.editable) {
      dataInput.append(this.renderToolbar());
    }
    dataInput.append(itemsEl);
    // ${this.renderToolbar()}
    // ${itemsEl}
    // console.log(frag);
    this.select();
  }
}
