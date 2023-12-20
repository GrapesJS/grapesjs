import { Model, $ } from '../..';
import EditorModel from '../../../editor/model/Editor';
import InputFactory from '..';
import TraitTextView from './TraitTextView';
import TraitList from '../model/TraitList';
import TraitView, { TraitViewOpts } from './TraitView';
import TraitGroup from '../model/TraitGroup';
import TraitGroupItem from '../model/TraitGroupItem';
import { isUndefined } from 'underscore';

export interface TraitListViewOpts extends TraitViewOpts<'list'> {
  traits: any[] | any;
}

export default class TraitListView<TModel extends Model = Model> extends TraitView<TraitList<TModel>> {
  protected type = 'list';
  templates: any[];
  private toolbarEl?: HTMLDivElement;
  private itemsEl?: JQuery<HTMLDivElement>[];
  private selectedEl?: JQuery<HTMLDivElement>;

  events() {
    return {
      'click [addButton]': this.addItem,
      'click [removeButton]': this.removeItem,
      'click [data-item-title]': this.select,
    };
  }

  private select(e?: any) {
    const { model, ppfx, selectedEl } = this;
    // model.setOpen(!model.get('open'));
    this.itemsEl?.forEach(el => {
      el.find('.data-item').get(0)!.style.display = 'none';
    });
    if (!isUndefined(e)) {
      var selected = $(e.target).closest(`.${ppfx}title`).find('.data-item');
      console.log(selected);
      this.selectedEl = selected;
      selected.get(0)!.style.display = '';
    } else if (!isUndefined(selectedEl)) {
      selectedEl.get(0)!.style.display = '';
    }
    console.log(e);
    // $el[isOpen ? 'addClass' : 'removeClass'](`${pfx}open`);
    // this.getPropertiesEl().style.display = isOpen ? '' : 'none';
  }

  constructor(em: EditorModel, opts: TraitListViewOpts) {
    super(em, { ...opts });
    console.log(opts);
    this.templates = opts.traits;
  }

  onUpdateEvent(value: any[]): void {
    console.log('Render');
    this.render();
  }

  private addItem(e: any) {
    e.preventDefault();
    this.target.add('');
    // this.render()
    console.log(this.target);
  }

  private removeItem(e: any) {
    e.preventDefault();

    this.target.add('');
    console.log('remove');
    console.log(this.target);
  }

  renderToolbar() {
    if (!this.toolbarEl) {
      let el = document.createElement('div');
      el.append(document.createElement('button'));
      let tmpl = `<div class="">
      <button addButton> Add </button>
      <button removeButton> Remove </button>
    </div>`;
      this.toolbarEl = $(tmpl).get(0);
    }
    return this.toolbarEl!;
  }

  renderItem(trait: TraitGroup | TraitGroupItem) {
    const { em, ppfx, label } = this;
    const icons = em?.getConfig().icons;
    const iconCaret = icons?.caret || '';
    const view = InputFactory.buildView(trait, em, { ...trait.opts, noLabel: true }).render();
    var itemEl = document.createElement('div');
    itemEl.setAttribute('data-item-title', '');
    itemEl.className = `${ppfx}title`;
    itemEl.innerHTML = `
        <div class="${ppfx}caret">${iconCaret}</div>
        
    `;
    // <div class="${ppfx}label">${label}</div>
    console.log(itemEl);
    var itemDataEl = document.createElement('div');
    itemDataEl.className = 'data-item';
    itemDataEl.append(view.el);
    console.log(itemEl);
    return $(itemEl).append(itemDataEl);
  }

  renderItems() {
    this.itemsEl = this.target.traits.map(trait => this.renderItem(trait));
  }

  render() {
    const { $el, pfx, ppfx, name, type, className } = this;
    console.log('render');
    const hasLabel = this.hasLabel();
    const cls = `${pfx}trait`;
    const { em } = this;
    var frag = document.createDocumentFragment();
    this.$el.empty();
    this.renderItems();
    this.itemsEl?.forEach(el => frag.appendChild(el.get(0)!));
    let itemsEl = document.createElement('div');
    itemsEl.className = `${ppfx}field-${type}-items`;
    itemsEl.append(frag);
    // el.className += model.isFull() ? ` ${className}--full` : '';
    let tmpl = `<div class="${cls} ${cls}--${type}">
    ${hasLabel ? `<div class="${ppfx}label" data-label></div>` : ''}
    <div class="${ppfx}field-wrp ${ppfx}field-wrp--${type} gjs-trt-trait--full" data-input>

    </div>
  </div>`;
    this.$el.append(tmpl);
    this.$el.find('[data-input]').append(this.renderToolbar()).append(itemsEl);
    // ${this.renderToolbar()}
    // ${itemsEl}
    // console.log(frag);
    console.log('render');
    this.select();

    this.setElement(this.el);
    return this;
  }
}
