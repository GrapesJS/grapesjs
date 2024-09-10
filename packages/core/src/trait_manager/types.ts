import { CategoryProperties, ItemsByCategory } from '../abstract/ModuleCategory';
import Component from '../dom_components/model/Component';
import Editor from '../editor';
import EditorModel from '../editor/model/Editor';
import { TraitManagerConfig } from './config/config';
import Trait from './model/Trait';
import TraitView from './view/TraitView';

export interface TraitViewTypes {
  [id: string]: { new (o: any): TraitView };
}

export interface ITraitView {
  noLabel?: TraitView['noLabel'];
  eventCapture?: TraitView['eventCapture'];
  templateInput?: TraitView['templateInput'];
  onEvent?: TraitView['onEvent'];
  onUpdate?: TraitView['onUpdate'];
  createInput?: TraitView['createInput'];
  createLabel?: TraitView['createLabel'];
}

export type CustomTrait<T> = ITraitView & T & ThisType<T & TraitView>;

export interface TraitModuleStateProps {
  component?: Component;
  traits: Trait[];
}

export interface TraitsByCategory extends ItemsByCategory<Trait> {}

export interface TraitManagerConfigModule extends TraitManagerConfig {
  pStylePrefix?: string;
  em: EditorModel;
}

export interface TraitCustomData {
  container?: HTMLElement;
}

export interface TraitProperties {
  /**
   * Trait type, defines how the trait should be rendered.
   * Possible values: `text` (default), `number`, `select`, `checkbox`, `color`, `button`
   */
  type?: string;

  /**
   * The name of the trait used as a key for the attribute/property.
   * By default, the name is used as attribute name or property in case `changeProp` in enabled.
   */
  name?: string;

  /**
   * Trait id, eg. `my-trait-id`.
   * If not specified, the `name` will be used as id.
   */
  id?: string | number;

  /**
   * Trait category.
   * @default ''
   */
  category?: string | CategoryProperties;

  /**
   * The trait label to show for the rendered trait.
   */
  label?: string | false;

  /**
   * If `true`, the trait value is applied on the component property, otherwise, on component attributes.
   * @default false
   */
  changeProp?: boolean;

  /**
   * Instead of relying on component props/attributes, define your own
   * logic on how to get the trait value.
   */
  getValue?: (props: { editor: Editor; trait: Trait; component: Component }) => any;

  /**
   * In conjunction with the `getValue`, define your own logic for updating the trait value.
   */
  setValue?: (props: {
    value: any;
    editor: Editor;
    trait: Trait;
    component: Component;
    partial: boolean;
    options: TraitSetValueOptions;
    emitUpdate: () => void;
  }) => void;

  /**
   * Custom true value for checkbox type.
   * @default 'true'
   */
  valueTrue?: string;

  /**
   * Custom false value for checkbox type.
   * * @default 'false'
   */
  valueFalse?: string;

  /**
   * Minimum number value for number type.
   */
  min?: number;

  /**
   * Maximum number value for number type.
   */
  max?: number;
  unit?: string;

  /**
   * Number of steps for number type.
   */
  step?: number;
  value?: any;
  target?: Component;
  default?: any;

  /**
   * Placeholder to show inside the default input (if the UI type allows it).
   */
  placeholder?: string;

  /**
   * Array of options for the select type.
   */
  options?: TraitOption[];

  /**
   * Label text to use for the button type.
   */
  text?: string;
  labelButton?: string;

  /**
   * Command to use for the button type.
   */
  command?: string | ((editor: Editor, trait: Trait) => any);

  full?: boolean;
  attributes?: Record<string, any>;
}

export interface TraitSetValueOptions {
  partial?: boolean;
  [key: string]: unknown;
}

export interface TraitGetValueOptions {
  /**
   * Get the value based on type.
   * With this option enabled, the returned value is normalized based on the
   * trait type (eg. the checkbox will always return a boolean).
   * @default false
   */
  useType?: boolean;
}

export interface TraitOption {
  id: string;
  label?: string;
  [key: string]: unknown;
}

export type TraitsEvent = `${TraitsEvents}`;

/**{START_EVENTS}*/
export enum TraitsEvents {
  /**
   * @event `trait:select` New traits selected (eg. by changing a component).
   * @example
   * editor.on('trait:select', ({ traits, component }) => { ... });
   */
  select = 'trait:select',

  /**
   * @event `trait:value` Trait value updated.
   * @example
   * editor.on('trait:value', ({ trait, component, value }) => { ... });
   */
  value = 'trait:value',

  /**
   * @event `trait:category:update` Trait category updated.
   * @example
   * editor.on('trait:category:update', ({ category, changes }) => { ... });
   */
  categoryUpdate = 'trait:category:update',

  /**
   * @event `trait:custom` Event to use in case of [custom Trait Manager UI](https://grapesjs.com/docs/modules/Traits.html#custom-trait-manager).
   * @example
   * editor.on('trait:custom', ({ container }) => { ... });
   */
  custom = 'trait:custom',

  /**
   * @event `trait` Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback.
   * @example
   * editor.on('trait', ({ event, model, ... }) => { ... });
   */
  all = 'trait',
}
/**{END_EVENTS}*/

// need this to avoid the TS documentation generator to break
export default TraitsEvents;
