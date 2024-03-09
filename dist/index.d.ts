import Backbone from 'backbone';

export interface NOOP {
}
export type Debounced = Function & {
	cancel(): void;
};
export type SetOptions = Backbone.ModelSetOptions & {
	avoidStore?: boolean;
};
export type AddOptions = Backbone.AddOptions & {
	temporary?: boolean;
};
export type DisableOptions = {
	fromMove?: boolean;
};
export type LocaleOptions = {
	locale?: boolean;
};
export type RemoveOptions = Backbone.Silenceable;
export type EventHandler = Backbone.EventHandler;
export type ObjectHash = Backbone.ObjectHash;
export type ObjectAny = Record<string, any>;
export type Nullable = undefined | null | false;
export type LiteralUnion<T, U> = T | (U & NOOP);
export type Position = {
	x: number;
	y: number;
};
export interface Coordinates {
	x: number;
	y: number;
}
export interface Dimensions {
	height: number;
	width: number;
}
export interface BoxRect extends Coordinates, Dimensions {
}
export type ElementRect = {
	top: number;
	left: number;
	width: number;
	height: number;
};
export type CombinedModelConstructorOptions<E, M extends Model<any, any, E> = Model> = Backbone.ModelConstructorOptions<M> & E;
export interface ViewOptions<TModel extends Model | undefined = Model, TElement extends Element = HTMLElement> extends Backbone.ViewOptions<TModel, TElement> {
}
declare class Model<T extends ObjectHash = any, S = SetOptions, E = any> extends Backbone.Model<T, S, E> {
}
declare class Collection<T extends Model = Model> extends Backbone.Collection<T> {
}
declare class View<T extends Model | undefined = Model, E extends Element = HTMLElement> extends Backbone.View<T, E> {
}
export type PickMatching<T, V> = {
	[K in keyof T as T[K] extends V ? K : never]: T[K];
};
export type ExtractMethods<T> = PickMatching<T, Function>;
declare enum CoordinatesTypes {
	Screen = "screen",
	World = "world"
}
export type PrevToNewIdMap = Record<string, string>;
export interface SelectorProps {
	name: string;
	label?: string;
	type?: number;
	active?: boolean;
	private?: boolean;
	protected?: boolean;
}
/**
 * @typedef Selector
 * @property {String} name Selector name, eg. `my-class`
 * @property {String} label Selector label, eg. `My Class`
 * @property {Number} [type=1] Type of the selector. 1 (class) | 2 (id)
 * @property {Boolean} [active=true] If not active, it's not selectable by the Style Manager.
 * @property {Boolean} [private=false] If true, it can't be seen by the Style Manager, but it will be rendered in the canvas and in export code.
 * @property {Boolean} [protected=false] If true, it can't be removed from the attached component.
 */
export declare class Selector extends Model<SelectorProps & {
	[key: string]: unknown;
}> {
	defaults(): {
		name: string;
		label: string;
		type: number;
		active: boolean;
		private: boolean;
		protected: boolean;
		_undo: boolean;
	};
	static readonly TYPE_CLASS = 1;
	static readonly TYPE_ID = 2;
	em: EditorModel;
	/**
	 * @hideconstructor
	 */
	constructor(props: any, opts?: any);
	isId(): boolean;
	isClass(): boolean;
	getFullName(opts?: any): string;
	/**
	 * Get selector as a string.
	 * @returns {String}
	 * @example
	 * // Given such selector: { name: 'my-selector', type: 2 }
	 * console.log(selector.toString());
	 * // -> `#my-selector`
	 */
	toString(): string;
	/**
	 * Get selector name.
	 * @returns {String}
	 * @example
	 * // Given such selector: { name: 'my-selector', label: 'My selector' }
	 * console.log(selector.getName());
	 * // -> `my-selector`
	 */
	getName(): string;
	/**
	 * Get selector label.
	 * @returns {String}
	 * @example
	 * // Given such selector: { name: 'my-selector', label: 'My selector' }
	 * console.log(selector.getLabel());
	 * // -> `My selector`
	 */
	getLabel(): string;
	/**
	 * Update selector label.
	 * @param {String} label New label
	 * @example
	 * // Given such selector: { name: 'my-selector', label: 'My selector' }
	 * selector.setLabel('New Label')
	 * console.log(selector.getLabel());
	 * // -> `New Label`
	 */
	setLabel(label: string): this;
	/**
	 * Get selector active state.
	 * @returns {Boolean}
	 */
	getActive(): boolean;
	/**
	 * Update selector active state.
	 * @param {Boolean} value New active state
	 */
	setActive(value: boolean): this;
	toJSON(opts?: {}): any;
	/**
	 * Escape string
	 * @param {string} name
	 * @return {string}
	 * @private
	 */
	static escapeName(name: string): string;
}
export interface FullNameOptions {
	combination?: boolean;
	array?: boolean;
}
export declare class Selectors extends Collection<Selector> {
	modelId(attr: any): string;
	getStyleable(): Selector[];
	getValid({ noDisabled }?: any): Selector[];
	getFullString(collection?: Selector[] | null, opts?: {
		sort?: boolean;
	}): string;
	getFullName<T extends FullNameOptions>(opts?: T): T["array"] extends true ? string[] : string;
}
export type StyleProps = Record<string, string | string[]>;
export type UpdateStyleOptions = ObjectAny & {
	partial?: boolean;
	addStyle?: StyleProps;
};
declare class StyleableModel<T extends ObjectHash = any> extends Model<T> {
	/**
	 * Forward style string to `parseStyle` to be parse to an object
	 * @param  {string} str
	 * @returns
	 */
	parseStyle(str: string): Record<string, string | string[]>;
	/**
	 * To trigger the style change event on models I have to
	 * pass a new object instance
	 * @param {Object} prop
	 * @return {Object}
	 */
	extendStyle(prop: ObjectAny): ObjectAny;
	/**
	 * Get style object
	 * @return {Object}
	 */
	getStyle(prop?: string | ObjectAny): StyleProps;
	/**
	 * Set new style object
	 * @param {Object|string} prop
	 * @param {Object} opts
	 * @return {Object} Applied properties
	 */
	setStyle(prop?: string | ObjectAny, opts?: UpdateStyleOptions): {
		[x: string]: any;
	};
	/**
	 * Add style property
	 * @param {Object|string} prop
	 * @param {string} value
	 * @example
	 * this.addStyle({color: 'red'});
	 * this.addStyle('color', 'blue');
	 */
	addStyle(prop: string | ObjectAny, value?: any, opts?: UpdateStyleOptions): void;
	/**
	 * Remove style property
	 * @param {string} prop
	 */
	removeStyle(prop: string): void;
	/**
	 * Returns string of style properties
	 * @param {Object} [opts={}] Options
	 * @return {String}
	 */
	styleToString(opts?: ObjectAny): string;
	getSelectors(): Selectors;
	getSelectorsString(opts?: ObjectAny): any;
}
export interface DomComponentsConfig {
	stylePrefix?: string;
	/**
	 * Could be used for default components.
	 */
	components?: Record<string, any>[];
	/**
	 * If the component is draggable you can drag the component itself (not only from the toolbar).
	 * @default true
	 */
	draggableComponents?: boolean;
	/**
	 * Experimental: Disable text inner components.
	 * With this option, you're able to decide which inner component inside text should be
	 * disabled (eg. no select, no hover, no layer visibility) once edited.
	 * @default false
	 * @example
	 * // disable all inner childs
	 * disableTextInnerChilds: true,
	 * // disable all except link components
	 * disableTextInnerChilds: (child) => !child.is('link'),
	 */
	disableTextInnerChilds?: boolean | ((cmp: Component) => boolean | void);
	/**
	 * You can setup a custom component definition processor before adding it into the editor.
	 * It might be useful to transform custom objects (es. some framework specific JSX) to GrapesJS component one.
	 * This custom function will be executed on ANY new added component to the editor so make smart checks/conditions
	 * to avoid doing useless executions
	 * By default, GrapesJS supports already elements generated from React JSX preset
	 * @example
	 * processor: (obj) => {
	 *  if (obj.$$typeof) { // eg. this is a React Element
	 *     const gjsComponent = {
	 *      type: obj.type,
	 *      components: obj.props.children,
	 *      ...
	 *     };
	 *     ...
	 *     return gjsComponent;
	 *  }
	 * }
	 */
	processor?: (obj: any) => Record<string, any> | undefined;
	/**
	 * List of HTML void elements.
	 * https://www.w3.org/TR/2011/WD-html-markup-20110113/syntax.html#void-elements
	 */
	voidElements?: string[];
	/**
	 * Experimental: Use the frame document for DOM element creation.
	 * This option might be useful when elements require the local document context to
	 * work properly (eg. Web Components).
	 */
	useFrameDoc?: boolean;
}
declare class ComponentWrapper extends Component {
	get defaults(): {
		tagName: string;
		removable: boolean;
		copyable: boolean;
		draggable: boolean;
		components: never[];
		traits: never[];
		stylable: string[];
	};
	__postAdd(): void;
	__postRemove(): void;
	static isComponent(): boolean;
}
declare class ModuleModel<TModule extends IBaseModule<any> = Module, T extends ObjectHash = any, S = SetOptions, E = any> extends Model<T, S, E> {
	private _module;
	constructor(module: TModule, attributes?: T, options?: CombinedModelConstructorOptions<E>);
	get module(): TModule;
	get config(): TModule extends IBaseModule<infer C> ? C : unknown;
	get em(): EditorModel;
}
export type ModuleExt<TModel extends ModuleModel> = TModel extends ModuleModel<infer M> ? M : unknown;
export type ModelConstructor<TModel extends ModuleModel> = {
	new (mod: ModuleExt<TModel>, attr: any): TModel;
};
declare class ModuleCollection<TModel extends ModuleModel = ModuleModel> extends Collection<TModel> {
	module: ModuleExt<TModel>;
	private newModel;
	add(model: Array<Record<string, any>> | TModel, options?: AddOptions): TModel;
	add(models: Array<Array<Record<string, any>> | TModel>, options?: AddOptions): TModel[];
	constructor(module: ModuleExt<TModel>, models: TModel[] | Array<Record<string, any>>, modelConstructor: ModelConstructor<TModel>);
	preinitialize(models?: TModel[] | Array<Record<string, any>>, options?: any): void;
}
export type ModuleFromModel<TModel extends ModuleModel> = TModel extends ModuleModel<infer M> ? M : unknown;
export type ModuleModelExt<TItem extends ModuleModel | ModuleCollection> = TItem extends ModuleCollection<infer M> ? ModuleFromModel<M> : TItem extends ModuleModel<infer M> ? M : unknown;
declare class ModuleView<TModel extends ModuleModel | ModuleCollection = ModuleModel, TElement extends Element = HTMLElement> extends View<TModel extends ModuleModel ? TModel : undefined, TElement> {
	protected get pfx(): string;
	protected get ppfx(): string;
	collection: TModel extends ModuleModel ? ModuleCollection<ModuleModel> : TModel;
	protected get module(): ModuleModelExt<TModel>;
	protected get em(): EditorModel;
	protected get config(): ModuleModelExt<TModel> extends IBaseModule<infer C> ? C : unknown;
	className: string;
	preinitialize(options?: any): void;
}
export type DragStop = (cancel?: boolean) => void;
export type DragContent = (content: any) => void;
declare class Droppable {
	em: EditorModel;
	canvas: CanvasModule;
	el: HTMLElement;
	counter: number;
	sortOpts?: Record<string, any> | null;
	over?: boolean;
	dragStop?: DragStop;
	dragContent?: DragContent;
	sorter?: any;
	constructor(em: EditorModel, rootEl?: HTMLElement);
	toggleEffects(el: HTMLElement, enable: boolean): void;
	__customTglEff(enable: boolean): void;
	startCustom(): void;
	endCustom(cancel?: boolean): void;
	/**
	 * This function is expected to be always executed at the end of d&d.
	 */
	endDrop(cancel?: boolean, ev?: Event): void;
	handleDragLeave(ev: Event): void;
	updateCounter(value: number, ev: Event): void;
	handleDragEnter(ev: DragEvent | Event): void;
	handleDragEnd(model: any, dt: any): void;
	/**
	 * Always need to have this handler active for enabling the drop
	 * @param {Event} ev
	 */
	handleDragOver(ev: Event): void;
	/**
	 * WARNING: This function might fail to run on drop, for example, when the
	 * drop, accidentally, happens on some external element (DOM not inside the iframe)
	 */
	handleDrop(ev: Event | DragEvent): void;
	getContentByData(dt: any): {
		content: any;
	};
}
export interface PageManagerConfig extends ModuleConfig {
	pages?: any[];
}
export interface SelectableOption {
	/**
	 * Select the page.
	 */
	select?: boolean;
}
export interface AbortOption {
	abort?: boolean;
}
declare enum PagesEvents {
	/**
	 * @event `page:add` Added new page. The page is passed as an argument to the callback.
	 * @example
	 * editor.on('page:add', (page) => { ... });
	 */
	add = "page:add",
	addBefore = "page:add:before",
	/**
	 * @event `page:remove` Page removed. The page is passed as an argument to the callback.
	 * @example
	 * editor.on('page:remove', (page) => { ... });
	 */
	remove = "page:remove",
	removeBefore = "page:remove:before",
	/**
	 * @event `page:select` New page selected. The newly selected page and the previous one, are passed as arguments to the callback.
	 * @example
	 * editor.on('page:select', (page, previousPage) => { ... });
	 */
	select = "page:select",
	selectBefore = "page:select:before",
	/**
	 * @event `page:update` Page updated. The updated page and the object containing changes are passed as arguments to the callback.
	 * @example
	 * editor.on('page:update', (page, changes) => { ... });
	 */
	update = "page:update",
	/**
	 * @event `page` Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback.
	 * @example
	 * editor.on('page', ({ event, model, ... }) => { ... });
	 */
	all = "page"
}
export declare class Frames extends ModuleCollection<Frame> {
	loadedItems: number;
	itemsToLoad: number;
	page?: Page;
	constructor(module: CanvasModule, models?: Frame[] | Array<Record<string, any>>);
	onAdd(frame: Frame): void;
	onReset(m: Frame, opts?: {
		previousModels?: Frame[];
	}): void;
	onRemove(frame: Frame): void;
	initRefs(): void;
	itemLoaded(): void;
	listenToLoad(): void;
	listenToLoadItems(on: boolean): void;
}
/** @private */
export interface CssRuleProperties {
	/**
	 * Array of selectors
	 */
	selectors: Selector[];
	/**
	 * Object containing style definitions
	 * @default {}
	 */
	style?: Record<string, any>;
	/**
	 * Additional string css selectors
	 * @default ''
	 */
	selectorsAdd?: string;
	/**
	 * Type of at-rule, eg. `media`, 'font-face'
	 * @default ''
	 */
	atRuleType?: string;
	/**
	 * At-rule value, eg. `(max-width: 1000px)`
	 * @default ''
	 */
	mediaText?: string;
	/**
	 * This property is used only on at-rules, like 'page' or 'font-face', where the block containes only style declarations.
	 * @default false
	 */
	singleAtRule?: boolean;
	/**
	 * State of the rule, eg: `hover`, `focused`
	 * @default ''
	 */
	state?: string;
	/**
	 * If true, sets `!important` on all properties. You can also pass an array to specify properties on which to use important.
	 * @default false
	 */
	important?: boolean | string[];
	/**
	 * Indicates if the rule is stylable from the editor.
	 * @default true
	 */
	stylable?: boolean | string[];
	/**
	 * Group for rules.
	 * @default ''
	 */
	group?: string;
	/**
	 * If true, the rule won't be stored in JSON or showed in CSS export.
	 * @default false
	 */
	shallow?: boolean;
}
export interface CssRuleJSON extends Omit<CssRuleProperties, "selectors"> {
	selectors: (string | SelectorProps)[];
}
/**
 * @typedef CssRule
 * @property {Array<Selector>} selectors Array of selectors
 * @property {Object} style Object containing style definitions
 * @property {String} [selectorsAdd=''] Additional string css selectors
 * @property {String} [atRuleType=''] Type of at-rule, eg. `media`, 'font-face'
 * @property {String} [mediaText=''] At-rule value, eg. `(max-width: 1000px)`
 * @property {Boolean} [singleAtRule=false] This property is used only on at-rules, like 'page' or 'font-face', where the block containes only style declarations
 * @property {String} [state=''] State of the rule, eg: `hover`, `focused`
 * @property {Boolean|Array<String>} [important=false] If true, sets `!important` on all properties. You can also pass an array to specify properties on which use important
 * @property {Boolean} [stylable=true] Indicates if the rule is stylable from the editor
 *
 * [Device]: device.html
 * [State]: state.html
 * [Component]: component.html
 */
export declare class CssRule extends StyleableModel<CssRuleProperties> {
	config: CssRuleProperties;
	em?: EditorModel;
	opt: any;
	defaults(): {
		selectors: never[];
		selectorsAdd: string;
		style: {};
		mediaText: string;
		state: string;
		stylable: boolean;
		atRuleType: string;
		singleAtRule: boolean;
		important: boolean;
		group: string;
		shallow: boolean;
		_undo: boolean;
	};
	constructor(props: CssRuleProperties, opt?: any);
	__onChange(m: CssRule, opts: any): void;
	clone(): CssRule;
	ensureSelectors(m: any, c: any, opts: any): void;
	/**
	 * Returns the at-rule statement when exists, eg. `@media (...)`, `@keyframes`
	 * @returns {String}
	 * @example
	 * const cssRule = editor.Css.setRule('.class1', { color: 'red' }, {
	 *  atRuleType: 'media',
	 *  atRuleParams: '(min-width: 500px)'
	 * });
	 * cssRule.getAtRule(); // "@media (min-width: 500px)"
	 */
	getAtRule(): string;
	/**
	 * Return selectors of the rule as a string
	 * @param {Object} [opts] Options
	 * @param {Boolean} [opts.skipState] Skip state from the result
	 * @returns {String}
	 * @example
	 * const cssRule = editor.Css.setRule('.class1:hover', { color: 'red' });
	 * cssRule.selectorsToString(); // ".class1:hover"
	 * cssRule.selectorsToString({ skipState: true }); // ".class1"
	 */
	selectorsToString(opts?: ObjectAny): string;
	/**
	 * Get declaration block (without the at-rule statement)
	 * @param {Object} [opts={}] Options (same as in `selectorsToString`)
	 * @returns {String}
	 * @example
	 * const cssRule = editor.Css.setRule('.class1', { color: 'red' }, {
	 *  atRuleType: 'media',
	 *  atRuleParams: '(min-width: 500px)'
	 * });
	 * cssRule.getDeclaration() // ".class1{color:red;}"
	 */
	getDeclaration(opts?: ObjectAny): string;
	/**
	 * Get the Device the rule is related to.
	 * @returns {[Device]|null}
	 * @example
	 * const device = rule.getDevice();
	 * console.log(device?.getName());
	 */
	getDevice(): any;
	/**
	 * Get the State the rule is related to.
	 * @returns {[State]|null}
	 * @example
	 * const state = rule.getState();
	 * console.log(state?.getLabel());
	 */
	getState(): any;
	/**
	 * Returns the related Component (valid only for component-specific rules).
	 * @returns {[Component]|null}
	 * @example
	 * const cmp = rule.getComponent();
	 * console.log(cmp?.toHTML());
	 */
	getComponent(): any;
	/**
	 * Return the CSS string of the rule
	 * @param {Object} [opts={}] Options (same as in `getDeclaration`)
	 * @return {String} CSS string
	 * @example
	 * const cssRule = editor.Css.setRule('.class1', { color: 'red' }, {
	 *  atRuleType: 'media',
	 *  atRuleParams: '(min-width: 500px)'
	 * });
	 * cssRule.toCSS() // "@media (min-width: 500px){.class1{color:red;}}"
	 */
	toCSS(opts?: ObjectAny): string;
	toJSON(...args: any): any;
	/**
	 * Compare the actual model with parameters
	 * @param {Object} selectors Collection of selectors
	 * @param {String} state Css rule state
	 * @param {String} width For which device this style is oriented
	 * @param {Object} ruleProps Other rule props
	 * @returns  {Boolean}
	 * @private
	 */
	compare(selectors: any, state?: string, width?: string, ruleProps?: Partial<CssRuleProperties>): boolean;
}
/** @private */
export interface PageProperties {
	/**
	 * Panel id.
	 */
	id?: string;
	/**
	 * Page name.
	 */
	name?: string;
	/**
	 * HTML to load as page content.
	 */
	component?: string | ComponentDefinition | ComponentDefinition[];
	/**
	 * CSS to load with the page.
	 */
	styles?: string | CssRuleJSON[];
	[key: string]: unknown;
}
export interface PagePropertiesDefined extends Pick<PageProperties, "id" | "name"> {
	frames: Frames;
	[key: string]: unknown;
}
export declare class Page extends Model<PagePropertiesDefined> {
	defaults(): {
		name: string;
		frames: Frames;
		_undo: boolean;
	};
	em: EditorModel;
	constructor(props: any, opts?: {
		em?: EditorModel;
		config?: PageManagerConfig;
	});
	onRemove(): void;
	getFrames(): Frames;
	/**
	 * Get page id
	 * @returns {String}
	 */
	getId(): string;
	/**
	 * Get page name
	 * @returns {String}
	 */
	getName(): string;
	/**
	 * Update page name
	 * @param {String} name New page name
	 * @example
	 * page.setName('New name');
	 */
	setName(name: string): this;
	/**
	 * Get all frames
	 * @returns {Array<Frame>}
	 * @example
	 * const arrayOfFrames = page.getAllFrames();
	 */
	getAllFrames(): Frame[];
	/**
	 * Get the first frame of the page (identified always as the main one)
	 * @returns {Frame}
	 * @example
	 * const mainFrame = page.getMainFrame();
	 */
	getMainFrame(): Frame;
	/**
	 * Get the root component (usually is the `wrapper` component) from the main frame
	 * @returns {Component}
	 * @example
	 * const rootComponent = page.getMainComponent();
	 * console.log(rootComponent.toHTML());
	 */
	getMainComponent(): ComponentWrapper;
	toJSON(opts?: {}): any;
}
export declare class Canvas extends ModuleModel<CanvasModule> {
	defaults(): {
		frame: string;
		frames: never[];
		rulers: boolean;
		zoom: number;
		x: number;
		y: number;
		scripts: never[];
		styles: never[];
		pointer: Coordinates;
		pointerScreen: Coordinates;
	};
	constructor(module: CanvasModule);
	get frames(): Frames;
	init(): void;
	_pageUpdated(page: Page, prev?: Page): void;
	updateDevice(opts?: any): void;
	onZoomChange(): void;
	onCoordsChange(): void;
	onPointerChange(): void;
	getPointerCoords(type?: CoordinatesTypes): Coordinates;
}
export type DraggerPosition = Position & {
	end?: boolean;
};
export type Guide = {
	x: number;
	y: number;
	lock?: number;
	active?: boolean;
};
export interface DraggerOptions {
	/**
	 * Element on which the drag will be executed. By default, the document will be used
	 */
	container?: HTMLElement;
	/**
	 * Callback on drag start.
	 * @example
	 * onStart(ev, dragger) {
	 *  console.log('pointer start', dragger.startPointer, 'position start', dragger.startPosition);
	 * }
	 */
	onStart?: (ev: Event, dragger: Dragger) => void;
	/**
	 * Callback on drag.
	 * @example
	 * onDrag(ev, dragger) {
	 *  console.log('pointer', dragger.currentPointer, 'position', dragger.position, 'delta', dragger.delta);
	 * }
	 */
	onDrag?: (ev: Event, dragger: Dragger) => void;
	/**
	 * Callback on drag end.
	 * @example
	 * onEnd(ev, dragger) {
	 *   console.log('pointer', dragger.currentPointer, 'position', dragger.position, 'delta', dragger.delta);
	 * }
	 */
	onEnd?: (ev: Event, dragger: Dragger, opts: {
		cancelled: boolean;
	}) => void;
	/**
	 * Indicate a callback where to pass an object with new coordinates
	 */
	setPosition?: (position: DraggerPosition) => void;
	/**
	 * Indicate a callback where to get initial coordinates.
	 * @example
	 * getPosition: () => {
	 *   // ...
	 *   return { x: 10, y: 100 }
	 * }
	 */
	getPosition?: () => DraggerPosition;
	/**
	 * Indicate a callback where to get pointer coordinates.
	 */
	getPointerPosition?: (ev: Event) => DraggerPosition;
	/**
	 * Static guides to be snapped.
	 */
	guidesStatic?: () => Guide[];
	/**
	 * Target guides that will snap to static one.
	 */
	guidesTarget?: () => Guide[];
	/**
	 * Offset before snap to guides.
	 * @default 5
	 */
	snapOffset?: number;
	/**
	 * Document on which listen to pointer events.
	 */
	doc?: Document;
	/**
	 * Scale result points, can also be a function.
	 * @default 1
	 */
	scale?: number | (() => number);
}
declare class Dragger {
	opts: DraggerOptions;
	startPointer: DraggerPosition;
	delta: DraggerPosition;
	lastScroll: DraggerPosition;
	lastScrollDiff: DraggerPosition;
	startPosition: DraggerPosition;
	globScrollDiff: DraggerPosition;
	currentPointer: DraggerPosition;
	position: DraggerPosition;
	el?: HTMLElement;
	guidesStatic: Guide[];
	guidesTarget: Guide[];
	lockedAxis?: any;
	docs: Document[];
	trgX?: Guide;
	trgY?: Guide;
	/**
	 * Init the dragger
	 * @param  {Object} opts
	 */
	constructor(opts?: DraggerOptions);
	/**
	 * Update options
	 * @param {Object} options
	 */
	setOptions(opts?: Partial<DraggerOptions>): void;
	toggleDrag(enable?: boolean): void;
	handleScroll(): void;
	/**
	 * Start dragging
	 * @param  {Event} e
	 */
	start(ev: Event): void;
	/**
	 * Drag event
	 * @param  {Event} event
	 */
	drag(ev: Event): void;
	/**
	 * Check if the delta hits some guide
	 */
	snapGuides(delta: DraggerPosition): {
		newDelta: DraggerPosition;
		trgX: Guide | undefined;
		trgY: Guide | undefined;
	};
	isPointIn(src: number, trg: number, { offset }?: {
		offset?: number;
	}): boolean;
	setGuideLock(guide: Guide, value: any): Guide;
	/**
	 * Stop dragging
	 */
	stop(ev: Event, opts?: {
		cancel?: boolean;
	}): void;
	keyHandle(ev: Event): void;
	/**
	 * Move the element
	 * @param  {integer} x
	 * @param  {integer} y
	 */
	move(x: number, y: number, end?: boolean): void;
	getContainerEl(): HTMLElement[] | Document[];
	getWindowEl(): any[];
	/**
	 * Returns documents
	 */
	getDocumentEl(el?: HTMLElement): Document[];
	/**
	 * Get mouse coordinates
	 * @param  {Event} event
	 * @return {Object}
	 */
	getPointerPos(ev: Event): DraggerPosition;
	getStartPosition(): {
		x: number;
		y: number;
	};
	getScrollInfo(): {
		y: number;
		x: number;
	};
	detectAxisLock(x: number, y: number): "x" | "y" | undefined;
}
export interface ToScreenOption {
	toScreen?: boolean;
}
export interface ToWorldOption {
	toWorld?: boolean;
}
export interface GetBoxRectOptions extends ToScreenOption {
	local?: boolean;
}
export interface CanvasRefreshOptions {
	/**
	 * Refresh canvas spots.
	 */
	spots?: boolean;
	all?: boolean;
}
declare enum CanvasEvents {
	/**
	 * @event `canvas:dragenter` Something is dragged inside the canvas, `DataTransfer` instance passed as an argument.
	 */
	dragEnter = "canvas:dragenter",
	/**
	 * @event `canvas:dragover` Something is dragging on the canvas, `DataTransfer` instance passed as an argument.
	 */
	dragOver = "canvas:dragover",
	/**
	 * @event `canvas:dragend` When a drag operation is ended, `DataTransfer` instance passed as an argument.
	 */
	dragEnd = "canvas:dragend",
	/**
	 * @event `canvas:dragdata` On any dataTransfer parse, `DataTransfer` instance and the `result` are passed as arguments.
	 * By changing `result.content` you're able to customize what is dropped.
	 */
	dragData = "canvas:dragdata",
	/**
	 * @event `canvas:drop` Something is dropped in canvas, `DataTransfer` instance and the dropped model are passed as arguments.
	 */
	drop = "canvas:drop",
	/**
	 * @event `canvas:spot` Spots updated.
	 * @example
	 * editor.on('canvas:spot', () => {
	 *  console.log('Spots', editor.Canvas.getSpots());
	 * });
	 */
	spot = "canvas:spot",
	/**
	 * @event `canvas:spot:add` New canvas spot added.
	 * @example
	 * editor.on('canvas:spot:add', ({ spot }) => {
	 *  console.log('Spot added', spot);
	 * });
	 */
	spotAdd = "canvas:spot:add",
	/**
	 * @event `canvas:spot:update` Canvas spot updated.
	 * @example
	 * editor.on('canvas:spot:update', ({ spot }) => {
	 *  console.log('Spot updated', spot);
	 * });
	 */
	spotUpdate = "canvas:spot:update",
	/**
	 * @event `canvas:spot:remove` Canvas spot removed.
	 * @example
	 * editor.on('canvas:spot:remove', ({ spot }) => {
	 *  console.log('Spot removed', spot);
	 * });
	 */
	spotRemove = "canvas:spot:remove",
	/**
	 * @event `canvas:coords` Canvas coordinates updated.
	 * @example
	 * editor.on('canvas:coords', () => {
	 *  console.log('Canvas coordinates updated:', editor.Canvas.getCoords());
	 * });
	 */
	coords = "canvas:coords",
	/**
	 * @event `canvas:zoom` Canvas zoom updated.
	 * @example
	 * editor.on('canvas:zoom', () => {
	 *  console.log('Canvas zoom updated:', editor.Canvas.getZoom());
	 * });
	 */
	zoom = "canvas:zoom",
	/**
	 * @event `canvas:pointer` Canvas pointer updated.
	 * @example
	 * editor.on('canvas:pointer', () => {
	 *  console.log('Canvas pointer updated:', editor.Canvas.getPointer());
	 * });
	 */
	pointer = "canvas:pointer",
	/**
	 * @event `canvas:refresh` Canvas was refreshed to update elements on top,
	 * like spots/tools (eg. via `editor.Canvas.refresh()` or on frame resize).
	 * @example
	 * editor.on('canvas:refresh', (canvasRefreshOptions) => {
	 *  console.log('Canvas refreshed with options:', canvasRefreshOptions);
	 * });
	 */
	refresh = "canvas:refresh",
	/**
	 * @event `canvas:frame:load` Frame loaded in canvas.
	 * The event is triggered right after iframe's `onload`.
	 * @example
	 * editor.on('canvas:frame:load', ({ window }) => {
	 *  console.log('Frame loaded', window);
	 * });
	 */
	frameLoad = "canvas:frame:load",
	/**
	 * @event `canvas:frame:load:head` Frame head loaded in canvas.
	 * The event is triggered right after iframe's finished to load the head elemenets (eg. scripts)
	 * @example
	 * editor.on('canvas:frame:load:head', ({ window }) => {
	 *  console.log('Frame head loaded', window);
	 * });
	 */
	frameLoadHead = "canvas:frame:load:head",
	/**
	 * @event `canvas:frame:load:body` Frame body loaded in canvas.
	 * The event is triggered when the body is rendered with components.
	 * @example
	 * editor.on('canvas:frame:load:body', ({ window }) => {
	 *  console.log('Frame completed the body render', window);
	 * });
	 */
	frameLoadBody = "canvas:frame:load:body"
}
declare abstract class ModuleDomainViews<TCollection extends ModuleCollection, TItemView extends ModuleView> extends ModuleView<TCollection> {
	itemsView: string;
	protected itemType: string;
	reuseView: boolean;
	viewCollection: TItemView[];
	constructor(opts?: any, autoAdd?: boolean);
	/**
	 * Add new model to the collection
	 * @param {ModuleModel} model
	 * @private
	 * */
	private addTo;
	private itemViewNotFound;
	protected abstract renderView(model: ModuleModel, itemType: string): TItemView;
	/**
	 * Render new model inside the view
	 * @param {ModuleModel} model
	 * @param {Object} fragment Fragment collection
	 * @private
	 * */
	private add;
	render(): this;
	onRender(): void;
	onRemoveBefore(items: TItemView[], opts: any): void;
	onRemove(items: TItemView[], opts: any): void;
	remove(opts?: any): this;
	clearItems(): void;
}
declare class FramesView extends ModuleDomainViews<Frames, FrameWrapView> {
	canvasView: CanvasView;
	private _module;
	constructor(opts: {} | undefined, config: any);
	onRemoveBefore(items: FrameWrapView[], opts?: {}): void;
	onRender(): void;
	clearItems(): void;
	protected renderView(item: any, type: string): FrameWrapView;
}
export interface MarginPaddingOffsets {
	marginTop?: number;
	marginRight?: number;
	marginBottom?: number;
	marginLeft?: number;
	paddingTop?: number;
	paddingRight?: number;
	paddingBottom?: number;
	paddingLeft?: number;
	borderTopWidth?: number;
	borderRightWidth?: number;
	borderBottomWidth?: number;
	borderLeftWidth?: number;
}
export type ElementPosOpts = {
	avoidFrameOffset?: boolean;
	avoidFrameZoom?: boolean;
	noScroll?: boolean;
};
export interface FitViewportOptions {
	frame?: Frame;
	gap?: number | {
		x: number;
		y: number;
	};
	ignoreHeight?: boolean;
	el?: HTMLElement;
}
declare class CanvasView extends ModuleView<Canvas> {
	template(): string;
	hlEl?: HTMLElement;
	badgeEl?: HTMLElement;
	placerEl?: HTMLElement;
	ghostEl?: HTMLElement;
	toolbarEl?: HTMLElement;
	resizerEl?: HTMLElement;
	offsetEl?: HTMLElement;
	fixedOffsetEl?: HTMLElement;
	toolsGlobEl?: HTMLElement;
	toolsEl?: HTMLElement;
	framesArea?: HTMLElement;
	toolsWrapper?: HTMLElement;
	spotsEl?: HTMLElement;
	cvStyle?: HTMLElement;
	clsUnscale: string;
	ready: boolean;
	frames: FramesView;
	frame?: FrameView;
	private timerZoom?;
	private frmOff?;
	private cvsOff?;
	constructor(model: Canvas);
	_onFramesUpdate(): void;
	_initFrames(): void;
	checkSelected(component: Component, opts?: {
		scroll?: ScrollIntoViewOptions;
	}): void;
	remove(...args: any): this;
	preventDefault(ev: Event): void;
	toggleListeners(enable: boolean): void;
	screenToWorld(x: number, y: number): Coordinates;
	onPointer(ev: WheelEvent): void;
	onKeyPress(ev: KeyboardEvent): void;
	onWheel(ev: WheelEvent): void;
	updateFrames(ev: Event): void;
	updateFramesArea(): void;
	fitViewport(opts?: FitViewportOptions): void;
	/**
	 * Checks if the element is visible in the canvas's viewport
	 * @param  {HTMLElement}  el
	 * @return {Boolean}
	 */
	isElInViewport(el: HTMLElement): boolean;
	/**
	 * Get the offset of the element
	 * @param  {HTMLElement} el
	 * @return { {top: number, left: number, width: number, height: number} }
	 */
	offset(el?: HTMLElement, opts?: ElementPosOpts): {
		top: number;
		left: number;
		width: number;
		height: number;
	};
	getRectToScreen(boxRect: Partial<BoxRect>): BoxRect;
	getElBoxRect(el: HTMLElement, opts?: GetBoxRectOptions): BoxRect;
	getViewportRect(opts?: ToWorldOption): BoxRect;
	getViewportDelta(opts?: {
		withZoom?: number;
	}): Coordinates;
	/**
	 * Cleare cached offsets
	 * @private
	 */
	clearOff(): void;
	/**
	 * Return frame offset
	 * @return { {top: number, left: number, width: number, height: number} }
	 * @public
	 */
	getFrameOffset(el?: HTMLElement): {
		top: number;
		left: number;
		width: number;
		height: number;
	};
	/**
	 * Return canvas offset
	 * @return { {top: number, left: number, width: number, height: number} }
	 * @public
	 */
	getCanvasOffset(): {
		top: number;
		left: number;
		width: number;
		height: number;
	};
	/**
	 * Returns element's rect info
	 * @param {HTMLElement} el
	 * @param {object} opts
	 * @return { {top: number, left: number, width: number, height: number, zoom: number, rect: any} }
	 * @public
	 */
	getElementPos(el: HTMLElement, opts?: ElementPosOpts): {
		top: number;
		left: number;
		height: number;
		width: number;
		zoom: number;
		rect: {
			top: number;
			left: number;
			width: number;
			height: number;
		};
	};
	/**
	 * Returns element's offsets like margins and paddings
	 * @param {HTMLElement} el
	 * @return { MarginPaddingOffsets }
	 * @public
	 */
	getElementOffsets(el: HTMLElement): MarginPaddingOffsets;
	/**
	 * Returns position data of the canvas element
	 * @return { {top: number, left: number, width: number, height: number} } obj Position object
	 * @public
	 */
	getPosition(opts?: any): ElementRect;
	/**
	 * Update javascript of a specific component passed by its View
	 * @param {ModuleView} view Component's View
	 * @private
	 */
	updateScript(view: any): void;
	/**
	 * Get javascript container
	 * @private
	 */
	getJsContainer(view?: ComponentView): HTMLElement | undefined;
	getFrameView(view?: ComponentView): FrameView | undefined;
	_renderFrames(): void;
	renderFrames(): void;
	render(): this;
}
declare class FrameWrapView extends ModuleView<Frame> {
	events(): {
		"click [data-action-remove]": string;
		"mousedown [data-action-move]": string;
	};
	elTools?: HTMLElement;
	frame: FrameView;
	dragger?: Dragger;
	cv: CanvasView;
	classAnim: string;
	sizeObserver?: ResizeObserver;
	constructor(model: Frame, canvasView: CanvasView);
	setupDragger(): void;
	startDrag(ev?: Event): void;
	__clear(opts?: any): void;
	remove(opts?: any): this;
	updateOffset(): void;
	updatePos(md?: boolean): void;
	updateSize(): void;
	/**
	 * Update dimensions of the frame
	 * @private
	 */
	updateDim(): void;
	onScroll(): void;
	frameLoaded(): void;
	__handleSize(): {
		noChanges: boolean;
		width: any;
		height: any;
		newW: any;
		newH: any;
	};
	render(): this;
}
declare class FrameView extends ModuleView<Frame, HTMLIFrameElement> {
	/** @ts-ignore */
	get tagName(): string;
	/** @ts-ignore */
	get attributes(): {
		allowfullscreen: string;
	};
	dragging: boolean;
	loaded: boolean;
	droppable?: Droppable;
	rect?: DOMRect;
	lastClientY?: number;
	lastMaxHeight: number;
	private jsContainer?;
	private tools;
	private wrapper?;
	private frameWrapView?;
	constructor(model: Frame, view?: FrameWrapView);
	getBoxRect(): BoxRect;
	/**
	 * Update `<head>` content of the frame
	 */
	updateHead(): void;
	getEl(): HTMLIFrameElement;
	getCanvasModel(): Canvas;
	getWindow(): Window;
	getDoc(): Document;
	getHead(): HTMLHeadElement;
	getBody(): HTMLBodyElement;
	getWrapper(): HTMLElement;
	getJsContainer(): HTMLElement;
	getToolsEl(): HTMLElement;
	getGlobalToolsEl(): HTMLElement;
	getHighlighter(): HTMLElement;
	getBadgeEl(): HTMLElement;
	getOffsetViewerEl(): HTMLElement;
	getRect(): DOMRect;
	/**
	 * Get rect data, not affected by the canvas zoom
	 */
	getOffsetRect(): {
		top: number;
		left: number;
		height: number;
		width: number;
		scrollTop: number;
		scrollLeft: number;
		scrollBottom: number;
		scrollRight: number;
	};
	_getTool(name: string): HTMLElement;
	remove(...args: any): this;
	startAutoscroll(): void;
	autoscroll(): void;
	updateClientY(ev: Event): void;
	showGlobalTools(): void;
	stopAutoscroll(): void;
	_toggleAutoscrollFx(enable: boolean): void;
	render(): this;
	renderScripts(): void;
	renderStyles(opts?: any): void;
	renderBody(): void;
	_toggleEffects(enable: boolean): void;
	_emitUpdate(): void;
}
export interface CssComposerConfig {
	/**
	 * Style prefix.
	 * @default 'css-'
	 */
	stylePrefix?: string;
	/**
	 * Default CSS style rules
	 */
	rules?: Array<string>;
}
export declare class CssRules extends Collection<CssRule> {
	editor: EditorModel;
	constructor(props: any, opt: any);
	toJSON(opts?: any): any;
	onAdd(model: CssRule, c: CssRules, o: any): void;
	onRemove(removed: CssRule): void;
	/** @ts-ignore */
	add(models: any, opt?: any): any[];
}
declare class CssRulesView extends View {
	atRules: Record<string, any>;
	config: Record<string, any>;
	em: EditorModel;
	pfx: string;
	renderStarted?: boolean;
	constructor(o: any);
	/**
	 * Add to collection
	 * @param {Object} model
	 * @private
	 * */
	addTo(model: CssRule): void;
	/**
	 * Add new object to collection
	 * @param {Object} model
	 * @param {Object} fragmentEl
	 * @return {Object}
	 * @private
	 * */
	addToCollection(model: CssRule, fragmentEl?: DocumentFragment): HTMLElement | undefined;
	getMediaWidth(mediaText: string): string;
	sortRules(a: number, b: number): number;
	render(): this;
}
/** @private */
export interface RuleOptions {
	/**
	 * At-rule type, eg. `media`
	 */
	atRuleType?: string;
	/**
	 * At-rule parameters, eg. `(min-width: 500px)`
	 */
	atRuleParams?: string;
}
/** @private */
export interface SetRuleOptions extends RuleOptions {
	/**
	 * If the rule exists already, merge passed styles instead of replacing them.
	 */
	addStyles?: boolean;
}
/** @private */
export interface GetSetRuleOptions {
	state?: string;
	mediaText?: string;
	addOpts?: ObjectAny;
	current?: boolean;
}
export type CssRuleStyle = Required<CssRuleProperties>["style"];
declare class CssComposer extends ItemManagerModule<CssComposerConfig & {
	pStylePrefix?: string;
}> {
	rules: CssRules;
	rulesView?: CssRulesView;
	Selectors: typeof Selectors;
	storageKey: string;
	/**
	 * Initializes module. Automatically called with a new instance of the editor
	 * @param {Object} config Configurations
	 * @private
	 */
	constructor(em: EditorModel);
	/**
	 * On load callback
	 * @private
	 */
	onLoad(): void;
	/**
	 * Do stuff after load
	 * @param  {Editor} em
	 * @private
	 */
	postLoad(): void;
	store(): any;
	load(data: any): any;
	/**
	 * Add new rule to the collection, if not yet exists with the same selectors
	 * @param {Array<Selector>} selectors Array of selectors
	 * @param {String} state Css rule state
	 * @param {String} width For which device this style is oriented
	 * @param {Object} props Other props for the rule
	 * @param {Object} opts Options for the add of new rule
	 * @return {Model}
	 * @private
	 * @example
	 * var sm = editor.SelectorManager;
	 * var sel1 = sm.add('myClass1');
	 * var sel2 = sm.add('myClass2');
	 * var rule = cssComposer.add([sel1, sel2], 'hover');
	 * rule.set('style', {
	 *   width: '100px',
	 *   color: '#fff',
	 * });
	 * */
	add(selectors: any, state?: string, width?: string, opts?: {}, addOpts?: {}): CssRule;
	/**
	 * Get the rule
	 * @param {String|Array<Selector>} selectors Array of selectors or selector string, eg `.myClass1.myClass2`
	 * @param {String} state Css rule state, eg. 'hover'
	 * @param {String} width Media rule value, eg. '(max-width: 992px)'
	 * @param {Object} ruleProps Other rule props
	 * @return  {Model|null}
	 * @private
	 * @example
	 * const sm = editor.SelectorManager;
	 * const sel1 = sm.add('myClass1');
	 * const sel2 = sm.add('myClass2');
	 * const rule = cssComposer.get([sel1, sel2], 'hover', '(max-width: 992px)');
	 * // Update the style
	 * rule.set('style', {
	 *   width: '300px',
	 *   color: '#000',
	 * });
	 * */
	get(selectors: any, state?: string, width?: string, ruleProps?: Omit<CssRuleProperties, "selectors">): CssRule | undefined;
	getAll(): CssRules;
	/**
	 * Add a raw collection of rule objects
	 * This method overrides styles, in case, of already defined rule
	 * @param {String|Array<Object>} data CSS string or an array of rule objects, eg. [{selectors: ['class1'], style: {....}}, ..]
	 * @param {Object} opts Options
	 * @param {Object} props Additional properties to add on rules
	 * @return {Array<Model>}
	 * @private
	 */
	addCollection(data: string | CssRuleJSON[], opts?: Record<string, any>, props?: {}): CssRule[];
	/**
	 * Add CssRules via CSS string.
	 * @param {String} css CSS string of rules to add.
	 * @returns {Array<[CssRule]>} Array of rules
	 * @example
	 * const addedRules = css.addRules('.my-cls{ color: red } @media (max-width: 992px) { .my-cls{ color: darkred } }');
	 * // Check rules
	 * console.log(addedRules.map(rule => rule.toCSS()));
	 */
	addRules(css: string): CssRule[];
	/**
	 * Add/update the CssRule.
	 * @param {String} selectors Selector string, eg. `.myclass`
	 * @param {Object} style  Style properties and values. If the rule exists, styles will be replaced unless `addStyles` option is used.
	 * @param {Object} [opts={}]  Additional properties.
	 * @param {String} [opts.atRuleType='']  At-rule type, eg. `media`.
	 * @param {String} [opts.atRuleParams='']  At-rule parameters, eg. `(min-width: 500px)`.
	 * @param {Boolean} [opts.addStyles=false] If the rule exists already, merge passed styles instead of replacing them.
	 * @returns {[CssRule]} The new/updated CssRule.
	 * @example
	 * // Simple class-based rule
	 * const rule = css.setRule('.class1.class2', { color: 'red' });
	 * console.log(rule.toCSS()) // output: .class1.class2 { color: red }
	 * // With state and other mixed selector
	 * const rule = css.setRule('.class1.class2:hover, div#myid', { color: 'red' });
	 * // output: .class1.class2:hover, div#myid { color: red }
	 * // With media
	 * const rule = css.setRule('.class1:hover', { color: 'red' }, {
	 *  atRuleType: 'media',
	 *  atRuleParams: '(min-width: 500px)',
	 * });
	 * // output: `@media (min-width: 500px) { .class1:hover { color: red } }`
	 *
	 * // Update styles of existent rule
	 * css.setRule('.class1', { color: 'red', background: 'red' });
	 * css.setRule('.class1', { color: 'blue' }, { addStyles: true });
	 * // output: .class1 { color: blue; background: red }
	 */
	setRule(selectors: any, style?: CssRuleProperties["style"], opts?: SetRuleOptions): CssRule;
	/**
	 * Get the CssRule.
	 * @param {String} selectors Selector string, eg. `.myclass:hover`
	 * @param {Object} [opts={}]  Additional properties
	 * @param {String} [opts.atRuleType='']  At-rule type, eg. `media`
	 * @param {String} [opts.atRuleParams='']  At-rule parameters, eg. '(min-width: 500px)'
	 * @returns {[CssRule]}
	 * @example
	 * const rule = css.getRule('.myclass1:hover');
	 * const rule2 = css.getRule('.myclass1:hover, div#myid');
	 * const rule3 = css.getRule('.myclass1', {
	 *  atRuleType: 'media',
	 *  atRuleParams: '(min-width: 500px)',
	 * });
	 */
	getRule(selectors: any, opts?: RuleOptions): CssRule | undefined;
	/**
	 * Get all rules or filtered by a matching selector.
	 * @param {String} [selector=''] Selector, eg. `.myclass`
	 * @returns {Array<[CssRule]>}
	 * @example
	 * // Take all the component specific rules
	 * const id = someComponent.getId();
	 * const rules = css.getRules(`#${id}`);
	 * console.log(rules.map(rule => rule.toCSS()))
	 * // All rules in the project
	 * console.log(css.getRules())
	 */
	getRules(selector?: string): CssRule[];
	/**
	 * Add/update the CSS rule with id selector
	 * @param {string} name Id selector name, eg. 'my-id'
	 * @param {Object} style  Style properties and values
	 * @param {Object} [opts={}]  Custom options, like `state` and `mediaText`
	 * @return {CssRule} The new/updated rule
	 * @private
	 * @example
	 * const rule = css.setIdRule('myid', { color: 'red' });
	 * const ruleHover = css.setIdRule('myid', { color: 'blue' }, { state: 'hover' });
	 * // This will add current CSS:
	 * // #myid { color: red }
	 * // #myid:hover { color: blue }
	 */
	setIdRule(name: string, style?: CssRuleStyle, opts?: GetSetRuleOptions): CssRule;
	/**
	 * Get the CSS rule by id selector
	 * @param {string} name Id selector name, eg. 'my-id'
	 * @param  {Object} [opts={}]  Custom options, like `state` and `mediaText`
	 * @return {CssRule}
	 * @private
	 * @example
	 * const rule = css.getIdRule('myid');
	 * const ruleHover = css.setIdRule('myid', { state: 'hover' });
	 */
	getIdRule(name: string, opts?: GetSetRuleOptions): CssRule | undefined;
	/**
	 * Add/update the CSS rule with class selector
	 * @param {string} name Class selector name, eg. 'my-class'
	 * @param {Object} style  Style properties and values
	 * @param {Object} [opts={}]  Custom options, like `state` and `mediaText`
	 * @return {CssRule} The new/updated rule
	 * @private
	 * @example
	 * const rule = css.setClassRule('myclass', { color: 'red' });
	 * const ruleHover = css.setClassRule('myclass', { color: 'blue' }, { state: 'hover' });
	 * // This will add current CSS:
	 * // .myclass { color: red }
	 * // .myclass:hover { color: blue }
	 */
	setClassRule(name: string, style?: CssRuleStyle, opts?: GetSetRuleOptions): CssRule;
	/**
	 * Get the CSS rule by class selector
	 * @param {string} name Class selector name, eg. 'my-class'
	 * @param  {Object} [opts={}]  Custom options, like `state` and `mediaText`
	 * @return {CssRule}
	 * @private
	 * @example
	 * const rule = css.getClassRule('myclass');
	 * const ruleHover = css.getClassRule('myclass', { state: 'hover' });
	 */
	getClassRule(name: string, opts?: GetSetRuleOptions): CssRule | undefined;
	/**
	 * Remove rule, by CssRule or matching selector (eg. the selector will match also at-rules like `@media`)
	 * @param {String|[CssRule]|Array<[CssRule]>} rule CssRule or matching selector.
	 * @return {Array<[CssRule]>} Removed rules
	 * @example
	 * // Remove by CssRule
	 * const toRemove = css.getRules('.my-cls');
	 * css.remove(toRemove);
	 * // Remove by selector
	 * css.remove('.my-cls-2');
	 */
	remove(rule: string | CssRule, opts?: any): CssRule[] | (CssRule & any[]);
	/**
	 * Remove all rules
	 * @return {this}
	 */
	clear(opts?: {}): this;
	getComponentRules(cmp: Component, opts?: GetSetRuleOptions): CssRule[];
	/**
	 * Render the block of CSS rules
	 * @return {HTMLElement}
	 * @private
	 */
	render(): HTMLElement;
	checkId(rule: CssRuleJSON | CssRuleJSON[], opts?: {
		idMap?: PrevToNewIdMap;
	}): CssRuleJSON[];
	destroy(): void;
}
declare class ComponentsView extends View {
	opts: any;
	config: DomComponentsConfig & {
		frameView?: FrameView;
	};
	em: EditorModel;
	parentEl?: HTMLElement;
	compView: typeof ComponentView;
	initialize(o: any): void;
	removeChildren(removed: Component, coll: any, opts?: {}): void;
	/**
	 * Add to collection
	 * @param {Model} model
	 * @param {Collection} coll
	 * @param {Object} opts
	 * @private
	 * */
	addTo(model: Component, coll?: any, opts?: {
		temporary?: boolean;
	}): void;
	/**
	 * Add new object to collection
	 * @param  {Object}  Model
	 * @param  {Object}   Fragment collection
	 * @param  {Integer}  Index of append
	 *
	 * @return   {Object}   Object rendered
	 * @private
	 * */
	addToCollection(model: Component, fragmentEl?: DocumentFragment | null, index?: number): HTMLElement | Text;
	resetChildren(models: Components, { previousModels }?: {
		previousModels?: never[] | undefined;
	}): void;
	render(parent?: HTMLElement): this;
}
export type ClbObj = ReturnType<ComponentView["_clbObj"]>;
export interface IComponentView extends ExtractMethods<ComponentView> {
}
export declare class ComponentView<TComp extends Component = Component> extends View</**
 * Keep this format to avoid errors in TS bundler */ 
/** @ts-ignore */
TComp> {
	/** @ts-ignore */
	model: TComp;
	/** @ts-ignore */
	className(): any;
	/** @ts-ignore */
	tagName(): string;
	modelOpt: ComponentOptions;
	em: EditorModel;
	opts?: any;
	pfx?: string;
	ppfx?: string;
	attr?: Record<string, any>;
	classe?: string;
	config: DomComponentsConfig;
	childrenView?: ComponentsView;
	getChildrenSelector?: Function;
	getTemplate?: Function;
	scriptContainer?: HTMLElement;
	preinitialize(opt?: any): void;
	initialize(opt?: any): void;
	get __cmpStyleOpts(): GetSetRuleOptions;
	get frameView(): FrameView;
	get createDoc(): Document;
	__isDraggable(): string | boolean | DraggableDroppableFn | undefined;
	_clbObj(): {
		editor: Editor;
		model: TComp;
		el: HTMLElement;
	};
	/**
	 * Initialize callback
	 */
	init(opts: ClbObj): void;
	/**
	 * Remove callback
	 */
	removed(opts: ClbObj): void;
	/**
	 * On render callback
	 */
	onRender(opts: ClbObj): void;
	/**
	 * Callback executed when the `active` event is triggered on component
	 */
	onActive(ev: Event): void;
	/**
	 * Callback executed when the `disable` event is triggered on component
	 */
	onDisable(opts?: DisableOptions): void;
	remove(): this;
	handleDragStart(event: Event): false | undefined;
	initClasses(): void;
	initComponents(opts?: {
		avoidRender?: boolean;
	}): void;
	/**
	 * Handle any property change
	 * @private
	 */
	handleChange(): void;
	/**
	 * Import, if possible, classes inside main container
	 * @private
	 * */
	importClasses(): void;
	/**
	 * Update item on status change
	 * @param  {Event} e
	 * @private
	 * */
	updateStatus(opts?: {
		noExtHl?: boolean;
		avoidHover?: boolean;
	}): void;
	/**
	 * Update highlight attribute
	 * @private
	 * */
	updateHighlight(): void;
	/**
	 * Update style attribute
	 * @private
	 * */
	updateStyle(m?: any, v?: any, opts?: ObjectAny): void;
	/**
	 * Update classe attribute
	 * @private
	 * */
	updateClasses(): void;
	/**
	 * Update single attribute
	 * @param {[type]} name  [description]
	 * @param {[type]} value [description]
	 */
	setAttribute(name: string, value: any): void;
	/**
	 * Get classes from attributes.
	 * This method is called before initialize
	 *
	 * @return  {Array}|null
	 * @private
	 * */
	getClasses(): any;
	/**
	 * Update attributes
	 * @private
	 * */
	updateAttributes(): void;
	/**
	 * Update component content
	 * @private
	 * */
	updateContent(): void;
	/**
	 * Prevent default helper
	 * @param  {Event} e
	 * @private
	 */
	prevDef(e: Event): void;
	/**
	 * Render component's script
	 * @private
	 */
	updateScript(): void;
	/**
	 * Return children container
	 * Differently from a simple component where children container is the
	 * component itself
	 * <my-comp>
	 *  <!--
	 *    <child></child> ...
	 *   -->
	 * </my-comp>
	 * You could have the children container more deeper
	 * <my-comp>
	 *  <div></div>
	 *  <div></div>
	 *  <div>
	 *    <div>
	 *      <!--
	 *        <child></child> ...
	 *      -->
	 *    </div>
	 *  </div>
	 * </my-comp>
	 * @return HTMLElement
	 * @private
	 */
	getChildrenContainer(): HTMLElement;
	/**
	 * This returns rect informations not affected by the canvas zoom.
	 * The method `getBoundingClientRect` doesn't work here and we
	 * have to take in account offsetParent
	 */
	getOffsetRect(): {
		top: number;
		left: number;
		bottom: number;
		right: number;
	};
	isInViewport(): boolean;
	scrollIntoView(opts?: {
		force?: boolean;
	} & ScrollIntoViewOptions): void;
	/**
	 * Recreate the element of the view
	 */
	reset(): void;
	_setData(): void;
	_createElement(tagName: string): Node;
	/**
	 * Render children components
	 * @private
	 */
	renderChildren(): void;
	renderAttributes(): void;
	onAttrUpdate(): void;
	render(): this;
	postRender(): void;
	static getEvents(): any;
}
declare enum CanvasSpotBuiltInTypes {
	Select = "select",
	Hover = "hover",
	Spacing = "spacing",
	Target = "target",
	Resize = "resize"
}
export type CanvasSpotBuiltInType = `${CanvasSpotBuiltInTypes}`;
export type CanvasSpotType = LiteralUnion<CanvasSpotBuiltInType, string>;
/** @private */
export interface CanvasSpotBase<T extends CanvasSpotType> {
	/**
	 * Spot type, eg. `select`.
	 */
	type: T;
	/**
	 * Spot ID.
	 */
	id: string;
	/**
	 * Fixed box rect of the spot, eg. `{ width: 100, height: 100, x: 0, y: 0 }`.
	 */
	boxRect?: BoxRect;
	/**
	 * Component to which the spot will be attached.
	 */
	component?: Component;
	/**
	 * ComponentView to which the spot will be attached.
	 */
	componentView?: ComponentView;
	frame?: Frame;
}
export interface CanvasSpotProps<T extends CanvasSpotType = CanvasSpotType> extends CanvasSpotBase<T> {
}
/**
 * Canvas spots are elements drawn on top of the canvas. They can be used to represent anything you
 * might need but the most common use case of canvas spots is rendering information and managing
 * components rendered in the canvas.
 * Read here for more information about [Canvas Spots](https://grapesjs.com/docs/modules/Canvas.html#canvas-spots)
 *
 * [Component]: component.html
 *
 * @property {String} id Spot ID.
 * @property {String} type Spot type.
 * @property {[Component]} [component] Component to which the spot will be attached.
 * @property {ComponentView} [componentView] ComponentView to which the spot will be attached.
 * @property {Object} [boxRect] Fixed box rect of the spot, eg. `{ width: 100, height: 100, x: 0, y: 0 }`.
 *
 */
export declare class CanvasSpot<T extends CanvasSpotProps = CanvasSpotProps> extends ModuleModel<CanvasModule, T> {
	defaults(): T;
	get type(): "" | T["type"];
	get component(): Component | undefined;
	get componentView(): ComponentView<Component> | undefined;
	get el(): HTMLElement | undefined;
	/**
	 * Get the box rect of the spot.
	 * @param {Object} [opts={}]
	 * @returns {Object} The box rect object
	 * @example
	 * canvasSpot.getBoxRect();
	 * // { width: 100, height: 50, x: 0, y: 0 }
	 */
	getBoxRect(opts?: GetBoxRectOptions): BoxRect;
	/**
	 * Get the style object of the spot.
	 * @param {Object} [opts={}]
	 * @returns {CSSStyleDeclaration} [opts]
	 * @example
	 * canvasSpot.getStyle();
	 * // { width: '100px', height: '...', ... }
	 */
	getStyle(opts?: {
		boxRect?: BoxRect;
	} & GetBoxRectOptions): Partial<CSSStyleDeclaration>;
	/**
	 * Check the spot type.
	 * @param {String} type
	 * @returns {Boolean}
	 * @example
	 * canvasSpot.isType('select');
	 */
	isType<E extends T>(type: E["type"]): this is CanvasSpot<E>;
}
export interface CanvasConfig {
	stylePrefix?: string;
	/**
	 * Append external scripts to the `<head>` of the iframe.
	 * Be aware that these scripts will not be printed in the export code.
	 * @default []
	 * @example
	 * scripts: [ 'https://...1.js', 'https://...2.js' ]
	 * // or passing objects as attributes
	 * scripts: [ { src: '/file.js', someattr: 'value' }, ... ]
	 */
	scripts?: (string | Record<string, any>)[];
	/**
	 * Append external styles to the `<head>` of the iframe.
	 * Be aware that these scripts will not be printed in the export code.
	 * @default []
	 * @example
	 * styles: [ 'https://...1.css', 'https://...2.css' ]
	 * // or passing objects as attributes
	 * styles: [ { href: '/style.css', someattr: 'value' }, ... ]
	 */
	styles?: (string | Record<string, any>)[];
	/**
	 * Add custom badge naming strategy.
	 * @example
	 * customBadgeLabel: component => component.getName(),
	 */
	customBadgeLabel?: (component: Component) => string;
	/**
	 * Indicate when to start the autoscroll of the canvas on component/block dragging (value in px).
	 * @default 50
	 */
	autoscrollLimit?: number;
	/**
	 * Experimental: external highlighter box
	 */
	extHl?: boolean;
	/**
	 * Initial content to load in all frames.
	 * The default value enables the standard mode for the iframe.
	 * @default '<!DOCTYPE html>'
	 */
	frameContent?: string;
	/**
	 * Initial style to load in all frames.
	 */
	frameStyle?: string;
	/**
	 * When some textable component is selected and focused (eg. input or text component), the editor
	 * stops some commands (eg. disables the copy/paste of components with CTRL+C/V to allow the copy/paste of the text).
	 * This option allows to customize, by a selector, which element should not be considered textable.
	 */
	notTextable?: string[];
	/**
	 * By default, the editor allows to drop external elements by relying on the native HTML5
	 * drag & drop API (eg. like a D&D of an image file from your desktop).
	 * If you want to customize how external elements are interpreted by the editor, you can rely
	 * on `canvas:dragdata` event, eg. https://github.com/GrapesJS/grapesjs/discussions/3849
	 * @default true
	 */
	allowExternalDrop?: boolean;
	/**
	 * Disable the rendering of built-in canvas spots.
	 *
	 * Read here for more information about [Canvas Spots](https://grapesjs.com/docs/modules/Canvas.html#canvas-spots).
	 * @example
	 * // Disable only the hover type spot
	 * customSpots: { hover: true },
	 *
	 * // Disable all built-in spots
	 * customSpots: true,
	 */
	customSpots?: boolean | Partial<Record<CanvasSpotBuiltInTypes, boolean>>;
	/**
	 * Experimental: enable infinite canvas.
	 */
	infiniteCanvas?: boolean;
}
export declare class CanvasSpots extends ModuleCollection<CanvasSpot> {
	refreshDbn: Debounced;
	constructor(module: CanvasModule, models?: CanvasSpot[] | CanvasSpotProps[]);
	get em(): EditorModel;
	get events(): typeof CanvasEvents;
	refresh(): void;
	onAdd(spot: CanvasSpot): void;
	onChange(spot: CanvasSpot): void;
	onRemove(spot: CanvasSpot): void;
	__trgEvent(event: string, props: ObjectAny): void;
}
export type CanvasEvent = `${CanvasEvents}`;
declare class CanvasModule extends Module<CanvasConfig> {
	/**
	 * Get configuration object
	 * @name getConfig
	 * @function
	 * @return {Object}
	 */
	/**
	 * Used inside RTE
	 * @private
	 */
	getCanvasView(): CanvasView;
	canvas: Canvas;
	model: Canvas;
	spots: CanvasSpots;
	events: typeof CanvasEvents;
	framesById: Record<string, Frame | undefined>;
	private canvasView?;
	/**
	 * Initialize module. Automatically called with a new instance of the editor
	 * @param {Object} config Configurations
	 * @private
	 */
	constructor(em: EditorModel);
	postLoad(): void;
	getModel(): Canvas;
	/**
	 * Get the canvas element
	 * @returns {HTMLElement}
	 */
	getElement(): HTMLElement;
	getFrame(index?: number): Frame;
	/**
	 * Get the main frame element of the canvas
	 * @returns {HTMLIFrameElement}
	 */
	getFrameEl(): HTMLIFrameElement;
	getFramesEl(): HTMLElement;
	/**
	 * Get the main frame window instance
	 * @returns {Window}
	 */
	getWindow(): Window;
	/**
	 * Get the main frame document element
	 * @returns {HTMLDocument}
	 */
	getDocument(): Document;
	/**
	 * Get the main frame body element
	 * @return {HTMLBodyElement}
	 */
	getBody(): HTMLBodyElement;
	_getLocalEl(globalEl: any, compView: ComponentView, method: keyof FrameView): any;
	/**
	 * Returns element containing all global canvas tools
	 * @returns {HTMLElement}
	 * @private
	 */
	getGlobalToolsEl(): HTMLElement | undefined;
	/**
	 * Returns element containing all canvas tools
	 * @returns {HTMLElement}
	 * @private
	 */
	getToolsEl(compView?: any): any;
	/**
	 * Returns highlighter element
	 * @returns {HTMLElement}
	 * @private
	 */
	getHighlighter(compView?: any): any;
	/**
	 * Returns badge element
	 * @returns {HTMLElement}
	 * @private
	 */
	getBadgeEl(compView: any): any;
	/**
	 * Returns placer element
	 * @returns {HTMLElement}
	 * @private
	 */
	getPlacerEl(): HTMLElement | undefined;
	/**
	 * Returns ghost element
	 * @returns {HTMLElement}
	 * @private
	 */
	getGhostEl(): HTMLElement | undefined;
	/**
	 * Returns toolbar element
	 * @returns {HTMLElement}
	 * @private
	 */
	getToolbarEl(): HTMLElement | undefined;
	/**
	 * Returns resizer element
	 * @returns {HTMLElement}
	 * @private
	 */
	getResizerEl(): HTMLElement | undefined;
	/**
	 * Returns offset viewer element
	 * @returns {HTMLElement}
	 * @private
	 */
	getOffsetViewerEl(compView: any): any;
	/**
	 * Returns fixed offset viewer element
	 * @returns {HTMLElement}
	 * @private
	 */
	getFixedOffsetViewerEl(): HTMLElement | undefined;
	getSpotsEl(): HTMLElement | undefined;
	render(): HTMLElement;
	/**
	 * Get frame position
	 * @returns {Object}
	 * @private
	 */
	getOffset(): {
		top: number;
		left: number;
	};
	/**
	 * Get the offset of the passed component element
	 * @param  {HTMLElement} el
	 * @returns {Object}
	 * @private
	 */
	offset(el: HTMLElement): {
		top: number;
		left: number;
		width: number;
		height: number;
	};
	/**
	 * Set custom badge naming strategy
	 * @param  {Function} f
	 * @example
	 * canvas.setCustomBadgeLabel(function(component){
	 *  return component.getName();
	 * });
	 */
	setCustomBadgeLabel(f: Function): void;
	/**
	 * Get element position relative to the canvas
	 * @param {HTMLElement} el
	 * @returns {Object}
	 * @private
	 */
	getElementPos(el: HTMLElement, opts?: any): {
		top: number;
		left: number;
		height: number;
		width: number;
		zoom: number;
		rect: {
			top: number;
			left: number;
			width: number;
			height: number;
		};
	};
	/**
	 * Returns element's offsets like margins and paddings
	 * @param {HTMLElement} el
	 * @returns {Object}
	 * @private
	 */
	getElementOffsets(el: HTMLElement): MarginPaddingOffsets;
	/**
	 * Get canvas rectangular data
	 * @returns {Object}
	 */
	getRect(): {
		topScroll: number;
		leftScroll: number;
		top: number;
		left: number;
		width: number;
		height: number;
	};
	/**
	 * This method comes handy when you need to attach something like toolbars
	 * to elements inside the canvas, dealing with all relative position,
	 * offsets, etc. and returning as result the object with positions which are
	 * viewable by the user (when the canvas is scrolled the top edge of the element
	 * is not viewable by the user anymore so the new top edge is the one of the canvas)
	 *
	 * The target should be visible before being passed here as invisible elements
	 * return empty string as width
	 * @param {HTMLElement} target The target in this case could be the toolbar
	 * @param {HTMLElement} element The element on which I'd attach the toolbar
	 * @param {Object} options Custom options
	 * @param {Boolean} options.toRight Set to true if you want the toolbar attached to the right
	 * @return {Object}
	 * @private
	 */
	getTargetToElementDim(target: HTMLElement, element: HTMLElement, options?: any): {
		top: number;
		left: any;
		elementTop: any;
		elementLeft: any;
		elementWidth: any;
		elementHeight: any;
		targetWidth: number;
		targetHeight: number;
		canvasTop: number;
		canvasLeft: number;
		canvasWidth: number;
		canvasHeight: number;
	} | undefined;
	canvasRectOffset(el: HTMLElement, pos: {
		top: number;
		left: number;
	}, opts?: any): {
		top: number;
		left: number;
	};
	/**
	 *
	 * @param {HTMLElement} el The component element in the canvas
	 * @param {HTMLElement} targetEl The target element to position (eg. toolbar)
	 * @param {Object} opts
	 * @private
	 */
	getTargetToElementFixed(el: HTMLElement, targetEl: HTMLElement, opts?: any): {
		top: number;
		left: any;
		canvasOffsetTop: any;
		canvasOffsetLeft: any;
		elRect: any;
		canvasOffset: any;
		canvasRect: ElementRect;
		targetWidth: number;
		targetHeight: number;
	};
	/**
	 * Instead of simply returning e.clientX and e.clientY this function
	 * calculates also the offset based on the canvas. This is helpful when you
	 * need to get X and Y position while moving between the editor area and
	 * canvas area, which is in the iframe
	 * @param {Event} e
	 * @return {Object}
	 * @private
	 */
	getMouseRelativePos(e: any, opts?: any): {
		y: number;
		x: number;
	};
	/**
	 * X and Y mouse position relative to the canvas
	 * @param {Event} ev
	 * @return {Object}
	 * @private
	 */
	getMouseRelativeCanvas(ev: MouseEvent, opts: any): {
		y: number;
		x: number;
	};
	/**
	 * Check if the canvas is focused
	 * @returns {Boolean}
	 */
	hasFocus(): boolean;
	/**
	 * Detects if some input is focused (input elements, text components, etc.)
	 * @return {Boolean}
	 * @private
	 */
	isInputFocused(): boolean | null;
	/**
	 * Scroll canvas to the element if it's not visible. The scrolling is
	 * executed via `scrollIntoView` API and options of this method are
	 * passed to it. For instance, you can scroll smoothly by using
	 * `{ behavior: 'smooth' }`.
	 * @param  {HTMLElement|[Component]} el
	 * @param  {Object} [opts={}] Options, same as options for `scrollIntoView`
	 * @param  {Boolean} [opts.force=false] Force the scroll, even if the element is already visible
	 * @example
	 * const selected = editor.getSelected();
	 * // Scroll smoothly (this behavior can be polyfilled)
	 * canvas.scrollTo(selected, { behavior: 'smooth' });
	 * // Force the scroll, even if the element is alredy visible
	 * canvas.scrollTo(selected, { force: true });
	 */
	scrollTo(el: any, opts?: {}): void;
	/**
	 * Start autoscroll
	 * @private
	 */
	startAutoscroll(frame?: Frame): void;
	/**
	 * Stop autoscroll
	 * @private
	 */
	stopAutoscroll(frame?: Frame): void;
	/**
	 * Set canvas zoom value
	 * @param {Number} value The zoom value, from 0 to 100
	 * @returns {this}
	 * @example
	 * canvas.setZoom(50); // set zoom to 50%
	 */
	setZoom(value: number | string): this;
	/**
	 * Get canvas zoom value
	 * @returns {Number}
	 * @example
	 * canvas.setZoom(50); // set zoom to 50%
	 * const zoom = canvas.getZoom(); // 50
	 */
	getZoom(): number;
	/**
	 * Set canvas position coordinates
	 * @param {Number} x Horizontal position
	 * @param {Number} y Vertical position
	 * @returns {this}
	 * @example
	 * canvas.setCoords(100, 100);
	 */
	setCoords(x?: string | number, y?: string | number, opts?: ToWorldOption): this;
	/**
	 * Get canvas position coordinates
	 * @returns {Object} Object containing coordinates
	 * @example
	 * canvas.setCoords(100, 100);
	 * const coords = canvas.getCoords();
	 * // { x: 100, y: 100 }
	 */
	getCoords(): Coordinates;
	/**
	 * Get canvas pointer position coordinates.
	 * @returns {Object} Object containing pointer coordinates
	 * @private
	 * @example
	 * const worldPointer = canvas.getPointer();
	 * const screenPointer = canvas.getPointer(true);
	 */
	getPointer(screen?: boolean): Coordinates;
	getZoomDecimal(): number;
	getZoomMultiplier(): number;
	fitViewport(opts?: FitViewportOptions): void;
	toggleFramesEvents(on: boolean): void;
	getFrames(): Frame[];
	/**
	 * Add new frame to the canvas
	 * @param {Object} props Frame properties
	 * @returns {[Frame]}
	 * @private
	 * @example
	 * canvas.addFrame({
	 *   name: 'Mobile home page',
	 *   x: 100, // Position in canvas
	 *   y: 100,
	 *   width: 500, // Frame dimensions
	 *   height: 600,
	 *   // device: 'DEVICE-ID',
	 *   components: [
	 *     '<h1 class="testh">Title frame</h1>',
	 *     '<p class="testp">Paragraph frame</p>',
	 *   ],
	 *   styles: `
	 *     .testh { color: red; }
	 *     .testp { color: blue; }
	 *   `,
	 * });
	 */
	addFrame(props?: {}, opts?: {}): Frame;
	/**
	 * Get the last created Component from a drag & drop to the canvas.
	 * @returns {[Component]|undefined}
	 */
	getLastDragResult(): Component | undefined;
	/**
	 * Add or update canvas spot.
	 * @param {Object} props Canvas spot properties.
	 * @param opts
	 * @returns {[CanvasSpot]}
	 * @example
	 * // Add new canvas spot
	 * const spot = canvas.addSpot({
	 *  type: 'select', // 'select' is one of the built-in spots
	 *  component: editor.getSelected(),
	 * });
	 *
	 * // Add custom canvas spot
	 * const spot = canvas.addSpot({
	 *  type: 'my-custom-spot',
	 *  component: editor.getSelected(),
	 * });
	 * // Update the same spot by reusing its ID
	 * canvas.addSpot({
	 *  id: spot.id,
	 *  component: anotherComponent,
	 * });
	 */
	addSpot<T extends CanvasSpotProps>(props: Omit<T, "id"> & {
		id?: string;
	}, opts?: AddOptions): CanvasSpot<T>;
	/**
	 * Get canvas spots.
	 * @param {Object} [spotProps] Canvas spot properties for filtering the result. With no properties, all available spots will be returned.
	 * @returns {[CanvasSpot][]}
	 * @example
	 * canvas.addSpot({ type: 'select', component: cmp1 });
	 * canvas.addSpot({ type: 'select', component: cmp2 });
	 * canvas.addSpot({ type: 'target', component: cmp3 });
	 *
	 * // Get all spots
	 * const allSpots = canvas.getSpots();
	 * allSpots.length; // 3
	 *
	 * // Get all 'select' spots
	 * const allSelectSpots = canvas.getSpots({ type: 'select' });
	 * allSelectSpots.length; // 2
	 */
	getSpots<T extends CanvasSpotProps>(spotProps?: Partial<T>): CanvasSpot<T>[];
	/**
	 * Remove canvas spots.
	 * @param {Object|[CanvasSpot][]} [spotProps] Canvas spot properties for filtering spots to remove or an array of spots to remove. With no properties, all available spots will be removed.
	 * @returns {[CanvasSpot][]}
	 * @example
	 * canvas.addSpot({ type: 'select', component: cmp1 });
	 * canvas.addSpot({ type: 'select', component: cmp2 });
	 * canvas.addSpot({ type: 'target', component: cmp3 });
	 *
	 * // Remove all 'select' spots
	 * canvas.removeSpots({ type: 'select' });
	 *
	 * // Remove spots by an array of canvas spots
	 * const filteredSpots = canvas.getSpots().filter(spot => myCustomCondition);
	 * canvas.removeSpots(filteredSpots);
	 *
	 * // Remove all spots
	 * canvas.removeSpots();
	 */
	removeSpots<T extends CanvasSpotProps>(spotProps?: Partial<T> | CanvasSpot[]): CanvasSpot<T>[];
	/**
	 * Check if the built-in canvas spot has a declared custom rendering.
	 * @param {String} type Built-in canvas spot type
	 * @returns {Boolean}
	 * @example
	 * grapesjs.init({
	 *  // ...
	 *  canvas: {
	 *    // avoid rendering the built-in 'target' canvas spot
	 *    customSpots: { target: true }
	 *  }
	 * });
	 * // ...
	 * canvas.hasCustomSpot('select'); // false
	 * canvas.hasCustomSpot('target'); // true
	 */
	hasCustomSpot(type?: CanvasSpotBuiltInTypes): boolean;
	/**
	 * Transform a box rect from the world coordinate system to the screen one.
	 * @param {Object} boxRect
	 * @returns {Object}
	 */
	getWorldRectToScreen(boxRect: Parameters<CanvasView["getRectToScreen"]>[0]): BoxRect | undefined;
	/**
	 * Update canvas for spots/tools positioning.
	 * @param {Object} [opts] Options.
	 * @param {Object} [opts.spots=false] Update the position of spots.
	 */
	refresh(opts?: CanvasRefreshOptions): void;
	refreshSpots(): void;
	destroy(): void;
}
/**
 * @property {Object|String} component Wrapper component definition. You can also pass an HTML string as components of the default wrapper component.
 * @property {String} [width=''] Width of the frame. By default, the canvas width will be taken.
 * @property {String} [height=''] Height of the frame. By default, the canvas height will be taken.
 * @property {Number} [x=0] Horizontal position of the frame in the canvas.
 * @property {Number} [y=0] Vertical position of the frame in the canvas.
 *
 */
export declare class Frame extends ModuleModel<CanvasModule> {
	defaults(): {
		x: number;
		y: number;
		changesCount: number;
		attributes: {};
		width: null;
		height: null;
		head: never[];
		component: string;
		styles: string;
		refFrame: null;
		_undo: boolean;
		_undoexc: string[];
	};
	view?: FrameView;
	/**
	 * @hideconstructor
	 */
	constructor(module: CanvasModule, attr: any);
	get width(): number;
	get height(): number;
	get head(): {
		tag: string;
		attributes: any;
	}[];
	get refFrame(): Frame | undefined;
	get root(): ComponentWrapper;
	initRefs(): void;
	getBoxRect(): BoxRect;
	onRemove(): void;
	changesUp(opt?: any): void;
	getComponent(): ComponentWrapper;
	getStyles(): any;
	disable(): void;
	remove(): this;
	getHead(): {
		tag: string;
		attributes: any;
	}[];
	setHead(value: {
		tag: string;
		attributes: any;
	}[]): this;
	addHeadItem(item: {
		tag: string;
		attributes: any;
	}): void;
	getHeadByAttr(attr: string, value: any, tag: string): {
		tag: string;
		attributes: any;
	};
	removeHeadByAttr(attr: string, value: any, tag: string): void;
	addLink(href: string): void;
	removeLink(href: string): void;
	addScript(src: string): void;
	removeScript(src: string): void;
	getPage(): Page | undefined;
	_emitUpdated(data?: {}): void;
	hasAutoHeight(): boolean;
	toJSON(opts?: any): any;
}
export interface CategoryViewConfig {
	em: EditorModel;
	pStylePrefix?: string;
	stylePrefix?: string;
}
declare class CategoryView extends View<Category> {
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
	events(): {
		"click [data-title]": string;
	};
	template({ pfx, label, catName }: {
		pfx: string;
		label: string;
		catName: string;
	}): string;
	/** @ts-ignore */
	attributes(): Record<string, any>;
	constructor(o: any, config: CategoryViewConfig, catName: string);
	updateVisibility(): void;
	open(): void;
	close(): void;
	toggle(): void;
	getIconEl(): HTMLElement;
	getTypeEl(): HTMLElement;
	append(el: HTMLElement): void;
	render(): this;
}
interface CategoryProperties {
	/**
	 * Category id.
	 */
	id: string;
	/**
	 * Category label.
	 */
	label: string;
	/**
	 * Category open state.
	 * @default true
	 */
	open?: boolean;
	/**
	 * Category order.
	 */
	order?: string | number;
	/**
	 * Category attributes.
	 * @default {}
	 */
	attributes?: Record<string, any>;
}
export interface ItemsByCategory<T> {
	category?: Category;
	items: T[];
}
export declare class Category extends Model<CategoryProperties> {
	view?: CategoryView;
	defaults(): {
		id: string;
		label: string;
		open: boolean;
		attributes: {};
	};
	getId(): string;
	getLabel(): string;
}
export interface TraitManagerConfig {
	/**
	 * Style prefix.
	 * @default 'trt-'
	 */
	stylePrefix?: string;
	/**
	 * Specify the element to use as a container, string (query) or HTMLElement.
	 * With the empty value, nothing will be rendered.
	 * @default ''
	 */
	appendTo?: string | HTMLElement;
	/**
	 * Avoid rendering the default Trait Manager UI.
	 * More about it here: [Custom Trait Manager](https://grapesjs.com/docs/modules/Traits.html#custom-trait-manager).
	 * @default false
	 */
	custom?: boolean;
	optionsTarget?: Record<string, any>[];
}
declare class TraitView extends View<Trait> {
	pfx: string;
	ppfx: string;
	config: any;
	clsField: string;
	elInput: HTMLInputElement;
	input?: HTMLInputElement;
	$input?: JQuery<HTMLInputElement>;
	eventCapture: string[];
	noLabel?: boolean;
	em: EditorModel;
	target: Component;
	createLabel?: (data: {
		label: string;
		component: Component;
		trait: TraitView;
	}) => string | HTMLElement;
	createInput?: (data: ReturnType<TraitView["getClbOpts"]>) => string | HTMLElement;
	events: any;
	appendInput: boolean;
	/** @ts-ignore */
	attributes(): Record<string, any>;
	templateLabel(cmp?: Component): string;
	templateInput(data: ReturnType<TraitView["getClbOpts"]>): string;
	constructor(o?: any);
	getClbOpts(): {
		component: Component;
		trait: Trait;
		elInput: HTMLInputElement;
	};
	removeView(): void;
	init(): void;
	removed(): void;
	onRender(props: ReturnType<TraitView["getClbOpts"]>): void;
	onUpdate(props: ReturnType<TraitView["getClbOpts"]>): void;
	onEvent(props: ReturnType<TraitView["getClbOpts"]> & {
		event: Event;
	}): void;
	/**
	 * Fires when the input is changed
	 * @private
	 */
	onChange(event: Event): void;
	getValueForTarget(): any;
	setInputValue(value: string): void;
	/**
	 * On change callback
	 * @private
	 */
	onValueChange(model: Trait, value: string, opts?: SetOptions & {
		fromTarget?: boolean;
	}): void;
	/**
	 * Render label
	 * @private
	 */
	renderLabel(): void;
	/**
	 * Returns label for the input
	 * @return {string}
	 * @private
	 */
	getLabel(): any;
	/**
	 * Returns current target component
	 */
	getComponent(): Component;
	/**
	 * Returns input element
	 * @return {HTMLElement}
	 * @private
	 */
	getInputEl(): HTMLInputElement | undefined;
	getInputElem(): HTMLInputElement;
	getModelValue(): any;
	getElInput(): HTMLInputElement;
	/**
	 * Renders input
	 * @private
	 * */
	renderField(): void;
	hasLabel(): boolean;
	rerender(): void;
	postUpdate(): void;
	render(): this;
}
declare class DomainViews extends View {
	config?: any;
	items: any[];
	ns?: string;
	itemView?: any;
	itemsView: any;
	itemType: string;
	reuseView: boolean;
	constructor(opts?: any, config?: any, autoAdd?: boolean);
	/**
	 * Add new model to the collection
	 * @param {Model} model
	 * @private
	 * */
	addTo(model: any): void;
	itemViewNotFound(type: string): void;
	/**
	 * Render new model inside the view
	 * @param {Model} model
	 * @param {Object} fragment Fragment collection
	 * @private
	 * */
	add(model: any, fragment?: DocumentFragment): void;
	render(): this;
	onRender(): void;
	onRemoveBefore(items?: any, opts?: any): void;
	onRemove(items?: any, opts?: any): void;
	remove(opts?: {}): this;
	clearItems(): void;
}
export interface TraitsViewProps {
	el?: HTMLElement;
	collection: any[];
	editor: EditorModel;
	config: TraitManagerConfigModule;
}
declare class TraitsView extends DomainViews {
	reuseView: boolean;
	em: EditorModel;
	pfx: string;
	ppfx: string;
	renderedCategories: Map<string, CategoryView>;
	config: TraitManagerConfigModule;
	traitContClass: string;
	catsClass: string;
	classNoCat: string;
	catsEl?: HTMLElement;
	traitsEl?: HTMLElement;
	rendered?: boolean;
	itemsView: TraitManager["types"];
	collection: Traits;
	constructor(props: TraitsViewProps, itemsView: TraitManager["types"]);
	/**
	 * Update view collection
	 * @private
	 */
	updatedCollection(): void;
	/**
	 * Render new model inside the view
	 * @param {Model} model
	 * @param {Object} fragment Fragment collection
	 * @private
	 * */
	add(model: Trait, fragment?: DocumentFragment): void;
	getCategoriesEl(): HTMLElement;
	getTraitsEl(): HTMLElement;
	append(el: HTMLElement | DocumentFragment): void;
	render(): this;
}
declare class TraitManager extends Module<TraitManagerConfigModule> {
	__ctn?: HTMLElement;
	view?: TraitsView;
	TraitsView: typeof TraitsView;
	events: typeof TraitsEvents;
	state: Model<TraitModuleStateProps, SetOptions, any>;
	types: TraitViewTypes;
	/**
	 * Get configuration object
	 * @name getConfig
	 * @function
	 * @returns {Object}
	 */
	/**
	 * Initialize module
	 * @private
	 */
	constructor(em: EditorModel);
	/**
	 * Select traits from a component.
	 * @param {[Component]} component
	 * @example
	 * tm.select(someComponent);
	 */
	select(component?: Component): void;
	/**
	 * Get trait categories from the currently selected component.
	 * @returns {Array<Category>}
	 * @example
	 * const traitCategories: Category[] = tm.getCategories();
	 *
	 */
	getCategories(): Category[];
	/**
	 * Get traits from the currently selected component.
	 * @returns {Array<[Trait]>}
	 * @example
	 * const currentTraits: Trait[] = tm.getTraits();
	 */
	getTraits(): Trait[];
	/**
	 * Get traits by category from the currently selected component.
	 * @example
	 * tm.getTraitsByCategory();
	 * // Returns an array of items of this type
	 * // > { category?: Category; items: Trait[] }
	 *
	 * // NOTE: The item without category is the one containing traits without category.
	 *
	 * // You can also get the same output format by passing your own array of Traits
	 * const myFilteredTraits: Trait[] = [...];
	 * tm.getTraitsByCategory(myFilteredTraits);
	 */
	getTraitsByCategory(traits?: Trait[]): TraitsByCategory[];
	/**
	 * Get component from the currently selected traits.
	 * @example
	 * tm.getComponent();
	 * // Component {}
	 */
	getComponent(): Component | undefined;
	/**
	 * Add new trait type.
	 * More about it here: [Define new Trait type](https://grapesjs.com/docs/modules/Traits.html#define-new-trait-type).
	 * @param {string} name Type name.
	 * @param {Object} methods Object representing the trait.
	 */
	addType<T>(name: string, methods: CustomTrait<T>): void;
	/**
	 * Get trait type
	 * @param {string} name Type name
	 * @returns {Object}
	 * @private
	 * const traitView = tm.getType('text');
	 */
	getType(name: string): new (o: any) => TraitView;
	/**
	 * Get all trait types
	 * @returns {Object}
	 * @private
	 */
	getTypes(): TraitViewTypes;
	/**
	 *
	 * Get Traits viewer
	 * @private
	 */
	getTraitsViewer(): TraitsView | undefined;
	getCurrent(): Trait[];
	render(): HTMLElement;
	postRender(): void;
	__onSelect(): void;
	__trgCustom(opts?: TraitCustomData): void;
	__customData(): TraitCustomData;
	__upSel(): void;
	__onUp(): void;
}
export declare class Categories extends Collection<Category> {
	/** @ts-ignore */
	add(model: (CategoryProperties | Category)[] | CategoryProperties | Category, opts?: AddOptions): Category;
	get(id: string | Category): Category;
}
export interface ModelWithCategoryProps {
	category?: string | CategoryProperties;
}
declare abstract class CollectionWithCategories<T extends Model<ModelWithCategoryProps>> extends Collection<T> {
	abstract getCategories(): Categories;
	initCategory(model: T): Category | undefined;
}
declare class TraitFactory {
	config: Partial<TraitManagerConfig>;
	constructor(config?: Partial<TraitManagerConfig>);
	/**
	 * Build props object by their name
	 */
	build(prop: string | TraitProperties, em: EditorModel): Trait;
	private buildFromString;
}
export declare class Traits extends CollectionWithCategories<Trait> {
	em: EditorModel;
	target: Component;
	tf: TraitFactory;
	categories: Categories;
	constructor(coll: TraitProperties[], options: {
		em: EditorModel;
	});
	get module(): TraitManager;
	getCategories(): Categories;
	handleReset(coll: TraitProperties[], { previousModels }?: {
		previousModels?: Trait[];
	}): void;
	handleAdd(model: Trait): void;
	setTarget(target: Component): void;
	add(model: string | TraitProperties | Trait, options?: AddOptions): Trait;
	add(models: Array<string | TraitProperties | Trait>, options?: AddOptions): Trait[];
}
/**
 * @property {String} id Trait id, eg. `my-trait-id`.
 * @property {String} type Trait type, defines how the trait should be rendered. Possible values: `text` (default), `number`, `select`, `checkbox`, `color`, `button`
 * @property {String} label The trait label to show for the rendered trait.
 * @property {String} name The name of the trait used as a key for the attribute/property. By default, the name is used as attribute name or property in case `changeProp` in enabled.
 * @property {String} default Default value to use in case the value is not defined on the component.
 * @property {String} placeholder Placeholder to show inside the default input (if the UI type allows it).
 * @property {String} [category=''] Trait category.
 * @property {Boolean} changeProp If `true`, the trait value is applied on the component property, otherwise, on component attributes.
 *
 * @module docsjs.Trait
 *
 */
export declare class Trait extends Model<TraitProperties> {
	target: Component;
	em: EditorModel;
	view?: TraitView;
	el?: HTMLElement;
	defaults(): {
		type: string;
		label: string;
		name: string;
		unit: string;
		step: number;
		value: string;
		default: string;
		placeholder: string;
		category: string;
		changeProp: boolean;
		options: never[];
	};
	constructor(prop: TraitProperties, em: EditorModel);
	get parent(): Traits;
	get category(): Category | undefined;
	get component(): Component;
	get changeProp(): boolean;
	setTarget(component: Component): void;
	/**
	 * Get the trait id.
	 * @returns {String}
	 */
	getId(): string | number;
	/**
	 * Get the trait type.
	 * @returns {String}
	 */
	getType(): string;
	/**
	 * Get the trait name.
	 * @returns {String}
	 */
	getName(): string;
	/**
	 * Get the trait label.
	 * @param {Object} [opts={}] Options.
	 * @param {Boolean} [opts.locale=true] Use the locale string from i18n module.
	 * @returns {String}
	 */
	getLabel(opts?: {
		locale?: boolean;
	}): any;
	/**
	 * Get the trait value.
	 * The value is taken from component attributes by default or from properties if the trait has the `changeProp` enabled.
	 * @param {Object} [opts={}] Options.
	 * @param {Boolean} [opts.useType=false] Get the value based on type (eg. the checkbox will always return a boolean).
	 * @returns {any}
	 */
	getValue(opts?: TraitGetValueOptions): any;
	/**
	 * Update the trait value.
	 * The value is applied on component attributes by default or on properties if the trait has the `changeProp` enabled.
	 * @param {any} value Value of the trait.
	 * @param {Object} [opts={}] Options.
	 * @param {Boolean} [opts.partial] If `true` the update won't be considered complete (not stored in UndoManager).
	 */
	setValue(value: any, opts?: TraitSetValueOptions): void;
	/**
	 * Get default value.
	 */
	getDefault(): any;
	/**
	 * Get trait options.
	 */
	getOptions(): TraitOption[];
	/**
	 * Get current selected option or by id.
	 * @param {String} [id] Option id.
	 * @returns {Object | null}
	 */
	getOption(id?: string): TraitOption | undefined;
	/**
	 * Get the option id from the option object.
	 * @param {Object} option Option object
	 * @returns {String} Option id
	 */
	getOptionId(option: TraitOption): string;
	/**
	 * Get option label.
	 * @param {String|Object} id Option id or the option object
	 * @param {Object} [opts={}] Options
	 * @param {Boolean} [opts.locale=true] Use the locale string from i18n module
	 * @returns {String} Option label
	 */
	getOptionLabel(id: string | TraitOption, opts?: LocaleOptions): string;
	/**
	 * Get category label.
	 * @param {Object} [opts={}] Options.
	 * @param {Boolean} [opts.locale=true] Use the locale string from i18n module.
	 * @returns {String}
	 */
	getCategoryLabel(opts?: LocaleOptions): string;
	/**
	 * Run the trait command (used on the button trait type).
	 */
	runCommand(): any;
	props(): Partial<TraitProperties>;
	targetUpdated(): void;
	getTargetValue(opts?: TraitGetValueOptions): any;
	setTargetValue(value: any, opts?: SetOptions): void;
	setValueFromInput(value: any, final?: boolean, opts?: SetOptions): void;
	getInitValue(): any;
}
export interface TraitViewTypes {
	[id: string]: {
		new (o: any): TraitView;
	};
}
export interface ITraitView {
	noLabel?: TraitView["noLabel"];
	eventCapture?: TraitView["eventCapture"];
	templateInput?: TraitView["templateInput"];
	onEvent?: TraitView["onEvent"];
	onUpdate?: TraitView["onUpdate"];
	createInput?: TraitView["createInput"];
	createLabel?: TraitView["createLabel"];
}
export type CustomTrait<T> = ITraitView & T & ThisType<T & TraitView>;
export interface TraitModuleStateProps {
	component?: Component;
	traits: Trait[];
}
export interface TraitsByCategory extends ItemsByCategory<Trait> {
}
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
	getValue?: (props: {
		editor: Editor;
		trait: Trait;
		component: Component;
	}) => any;
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
declare enum TraitsEvents {
	/**
	 * @event `trait:select` New traits selected (eg. by changing a component).
	 * @example
	 * editor.on('trait:select', ({ traits, component }) => { ... });
	 */
	select = "trait:select",
	/**
	 * @event `trait:value` Trait value updated.
	 * @example
	 * editor.on('trait:value', ({ trait, component, value }) => { ... });
	 */
	value = "trait:value",
	/**
	 * @event `trait:custom` Event to use in case of [custom Trait Manager UI](https://grapesjs.com/docs/modules/Traits.html#custom-trait-manager).
	 * @example
	 * editor.on('trait:custom', ({ container }) => { ... });
	 */
	custom = "trait:custom",
	/**
	 * @event `trait` Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback.
	 * @example
	 * editor.on('trait', ({ event, model, ... }) => { ... });
	 */
	all = "trait"
}
export type RectDim = {
	t: number;
	l: number;
	w: number;
	h: number;
};
export type BoundingRect = {
	left: number;
	top: number;
	width: number;
	height: number;
};
export type CallbackOptions = {
	docs: any;
	config: any;
	el: HTMLElement;
	resizer: Resizer;
};
export interface ResizerUpdateTargetOptions {
	store: boolean;
	selectedHandler?: string;
	resizer: Resizer;
	config: ResizerOptions;
}
export interface ResizerOnUpdateContainerOptions {
	el: HTMLElement;
	resizer: Resizer;
	opts: ResizerOptions;
}
export interface ResizerOptions {
	/**
	 * Function which returns custom X and Y coordinates of the mouse.
	 */
	mousePosFetcher?: (ev: Event) => Position;
	/**
	 * Indicates custom target updating strategy.
	 */
	updateTarget?: (el: HTMLElement, rect: RectDim, opts: ResizerUpdateTargetOptions) => void;
	/**
	 * Function which gets HTMLElement as an arg and returns it relative position
	 */
	posFetcher?: (el: HTMLElement, opts: ElementPosOpts) => BoundingRect;
	/**
	 * Indicate if the resizer should keep the default ratio.
	 * @default false
	 */
	ratioDefault?: boolean;
	/**
	 * On resize start callback.
	 */
	onStart?: (ev: Event, opts: CallbackOptions) => void;
	/**
	 * On resize move callback.
	 */
	onMove?: (ev: Event) => void;
	/**
	 * On resize end callback.
	 */
	onEnd?: (ev: Event, opts: CallbackOptions) => void;
	/**
	 * On container update callback.
	 */
	onUpdateContainer?: (opts: ResizerOnUpdateContainerOptions) => void;
	/**
	 * Resize unit step.
	 * @default 1
	 */
	step?: number;
	/**
	 * Minimum dimension.
	 * @default 10
	 */
	minDim?: number;
	/**
	 * Maximum dimension.
	 * @default Infinity
	 */
	maxDim?: number;
	/**
	 * Unit used for height resizing.
	 * @default 'px'
	 */
	unitHeight?: string;
	/**
	 * Unit used for width resizing.
	 * @default 'px'
	 */
	unitWidth?: string;
	/**
	 * The key used for height resizing.
	 * @default 'height'
	 */
	keyHeight?: string;
	/**
	 * The key used for width resizing.
	 * @default 'width'
	 */
	keyWidth?: string;
	/**
	 * If true, will override unitHeight and unitWidth, on start, with units
	 * from the current focused element (currently used only in SelectComponent).
	 * @default true
	 */
	currentUnit?: boolean;
	/**
	 * With this option enabled the mousemove event won't be altered when the pointer comes over iframes.
	 * @default false
	 */
	silentFrames?: boolean;
	/**
	 * If true the container of handlers won't be updated.
	 * @default false
	 */
	avoidContainerUpdate?: boolean;
	/**
	 * If height is 'auto', this setting will preserve it and only update the width.
	 * @default false
	 */
	keepAutoHeight?: boolean;
	/**
	 * If width is 'auto', this setting will preserve it and only update the height.
	 * @default false
	 */
	keepAutoWidth?: boolean;
	/**
	 * When keepAutoHeight is true and the height has the value 'auto', this is set to true and height isn't updated.
	 * @default false
	 */
	autoHeight?: boolean;
	/**
	 * When keepAutoWidth is true and the width has the value 'auto', this is set to true and width isn't updated.
	 * @default false
	 */
	autoWidth?: boolean;
	/**
	 * Enable top left handler.
	 * @default true
	 */
	tl?: boolean;
	/**
	 * Enable top center handler.
	 * @default true
	 */
	tc?: boolean;
	/**
	 * Enable top right handler.
	 * @default true
	 */
	tr?: boolean;
	/**
	 * Enable center left handler.
	 * @default true
	 */
	cl?: boolean;
	/**
	 * Enable center right handler.
	 * @default true
	 */
	cr?: boolean;
	/**
	 * Enable bottom left handler.
	 * @default true
	 */
	bl?: boolean;
	/**
	 * Enable bottom center handler.
	 * @default true
	 */
	bc?: boolean;
	/**
	 * Enable bottom right handler.
	 * @default true
	 */
	br?: boolean;
	/**
	 * Class prefix.
	 */
	prefix?: string;
	/**
	 * Where to append resize container (default body element).
	 */
	appendTo?: HTMLElement;
}
export type Handlers = Record<string, HTMLElement | null>;
declare class Resizer {
	defOpts: ResizerOptions;
	opts: ResizerOptions;
	container?: HTMLElement;
	handlers?: Handlers;
	el?: HTMLElement;
	clickedHandler?: HTMLElement;
	selectedHandler?: HTMLElement;
	handlerAttr?: string;
	startDim?: RectDim;
	rectDim?: RectDim;
	parentDim?: RectDim;
	startPos?: Position;
	delta?: Position;
	currentPos?: Position;
	docs?: Document[];
	keys?: {
		shift: boolean;
		ctrl: boolean;
		alt: boolean;
	};
	mousePosFetcher?: ResizerOptions["mousePosFetcher"];
	updateTarget?: ResizerOptions["updateTarget"];
	posFetcher?: ResizerOptions["posFetcher"];
	onStart?: ResizerOptions["onStart"];
	onMove?: ResizerOptions["onMove"];
	onEnd?: ResizerOptions["onEnd"];
	onUpdateContainer?: ResizerOptions["onUpdateContainer"];
	/**
	 * Init the Resizer with options
	 * @param  {Object} options
	 */
	constructor(opts?: ResizerOptions);
	/**
	 * Get current connfiguration options
	 * @return {Object}
	 */
	getConfig(): ResizerOptions;
	/**
	 * Setup options
	 * @param {Object} options
	 */
	setOptions(options?: Partial<ResizerOptions>, reset?: boolean): void;
	/**
	 * Setup resizer
	 */
	setup(): void;
	/**
	 * Toggle iframes pointer event
	 * @param {Boolean} silent If true, iframes will be silented
	 */
	toggleFrames(silent?: boolean): void;
	/**
	 * Detects if the passed element is a resize handler
	 * @param  {HTMLElement} el
	 * @return {Boolean}
	 */
	isHandler(el: HTMLElement): boolean;
	/**
	 * Returns the focused element
	 * @return {HTMLElement}
	 */
	getFocusedEl(): HTMLElement | undefined;
	/**
	 * Returns the parent of the focused element
	 * @return {HTMLElement}
	 */
	getParentEl(): HTMLElement | null | undefined;
	/**
	 * Returns documents
	 */
	getDocumentEl(): Document[];
	/**
	 * Return element position
	 * @param  {HTMLElement} el
	 * @param  {Object} opts Custom options
	 * @return {Object}
	 */
	getElementPos(el: HTMLElement, opts?: ElementPosOpts): BoundingRect;
	/**
	 * Focus resizer on the element, attaches handlers to it
	 * @param {HTMLElement} el
	 */
	focus(el: HTMLElement): void;
	/**
	 * Blur from element
	 */
	blur(): void;
	/**
	 * Start resizing
	 * @param  {Event} e
	 */
	start(ev: Event): void;
	/**
	 * While resizing
	 * @param  {Event} e
	 */
	move(ev: PointerEvent | Event): void;
	/**
	 * Stop resizing
	 * @param  {Event} e
	 */
	stop(e: Event): void;
	/**
	 * Update rect
	 */
	updateRect(store: boolean): void;
	updateContainer(opt?: {
		forceShow?: boolean;
	}): void;
	/**
	 * Get selected handler name
	 * @return {string}
	 */
	getSelectedHandler(): string | undefined;
	/**
	 * Handle ESC key
	 * @param  {Event} e
	 */
	handleKeyDown(e: Event): void;
	/**
	 * Handle mousedown to check if it's possible to start resizing
	 * @param  {Event} e
	 */
	handleMouseDown(e: Event): void;
	/**
	 * All positioning logic
	 * @return {Object}
	 */
	calc(data: Resizer): RectDim | undefined;
}
export interface ICommand<O extends ObjectAny = any> {
	run?: CommandAbstract<O>["run"];
	stop?: CommandAbstract<O>["stop"];
	id?: string;
	[key: string]: unknown;
}
export type CommandFunction<O extends ObjectAny = any> = CommandAbstract<O>["run"];
export type Command = CommandObject | CommandFunction;
export type CommandOptions = Record<string, any>;
export type CommandObject<O extends ObjectAny = any, T extends ObjectAny = {}> = ICommand<O> & T & ThisType<T & CommandAbstract<O>>;
declare class CommandAbstract<O extends ObjectAny = any> extends Model {
	config: any;
	em: EditorModel;
	pfx: string;
	ppfx: string;
	hoverClass: string;
	badgeClass: string;
	plhClass: string;
	freezClass: string;
	canvas: CanvasModule;
	constructor(o: any);
	/**
	 * On frame scroll callback
	 * @param  {[type]} e [description]
	 * @return {[type]}   [description]
	 */
	onFrameScroll(e: any): void;
	/**
	 * Returns canval element
	 * @return {HTMLElement}
	 */
	getCanvas(): HTMLElement;
	/**
	 * Get canvas body element
	 * @return {HTMLElement}
	 */
	getCanvasBody(): HTMLBodyElement;
	/**
	 * Get canvas wrapper element
	 * @return {HTMLElement}
	 */
	getCanvasTools(): any;
	/**
	 * Get the offset of the element
	 * @param  {HTMLElement} el
	 * @return {Object}
	 */
	offset(el: HTMLElement): {
		top: number;
		left: number;
	};
	/**
	 * Callback triggered after initialize
	 * @param  {Object}  o   Options
	 * @private
	 * */
	init(o: any): void;
	/**
	 * Method that run command
	 * @param  {Object}  editor Editor instance
	 * @param  {Object}  [options={}] Options
	 * @private
	 * */
	callRun(editor: Editor, options?: any): void;
	/**
	 * Method that run command
	 * @param  {Object}  editor Editor instance
	 * @param  {Object}  [options={}] Options
	 * @private
	 * */
	callStop(editor: Editor, options?: any): void;
	/**
	 * Stop current command
	 */
	stopCommand(opts?: any): void;
	/**
	 * Method that run command
	 * @param  {Object}  em     Editor model
	 * @param  {Object}  sender  Button sender
	 * @private
	 * */
	run(em: Editor, sender: any, options: O): void;
	/**
	 * Method that stop command
	 * @param  {Object}  em Editor model
	 * @param  {Object}  sender  Button sender
	 * @private
	 * */
	stop(em: Editor, sender: any, options: O): void;
}
export interface ToolbarButtonProps {
	/**
	 * Command name.
	 */
	command: CommandFunction | string;
	/**
	 * Button label.
	 */
	label?: string;
	id?: string;
	attributes?: ObjectAny;
	events?: ObjectAny;
}
export type DragMode = "translate" | "absolute" | "";
export type DraggableDroppableFn = (source: Component, target: Component, index?: number) => boolean | void;
export interface ComponentStackItem {
	id: string;
	model: typeof Component;
	view: typeof ComponentView<any>;
}
/**
 * Delegate commands to other components.
 */
export interface ComponentDelegateProps {
	/**
	 * Delegate remove command to another component.
	 * @example
	 * delegate: {
	 *  remove: (cmp) => cmp.closestType('other-type'),
	 * }
	 */
	remove?: (cmp: Component) => Component | Nullable;
	/**
	 * Delegate move command to another component.
	 * @example
	 * delegate: {
	 *  move: (cmp) => cmp.closestType('other-type'),
	 * }
	 */
	move?: (cmp: Component) => Component | Nullable;
	/**
	 * Delegate copy command to another component.
	 * @example
	 * delegate: {
	 *  copy: (cmp) => cmp.closestType('other-type'),
	 * }
	 */
	copy?: (cmp: Component) => Component | Nullable;
	/**
	 * Delegate select command to another component.
	 * @example
	 * delegate: {
	 *  select: (cmp) => cmp.findType('other-type')[0],
	 * }
	 */
	select?: (cmp: Component) => Component | Nullable;
}
export interface ComponentProperties {
	/**
	 * Component type, eg. `text`, `image`, `video`, etc.
	 * @default ''
	 */
	type?: string;
	/**
	 * HTML tag of the component, eg. `span`. Default: `div`
	 * @default 'div'
	 */
	tagName?: string;
	/**
	 * Key-value object of the component's attributes, eg. `{ title: 'Hello' }` Default: `{}`
	 * @default {}
	 */
	attributes?: Record<string, any>;
	/**
	 * Name of the component. Will be used, for example, in Layers and badges
	 * @default ''
	 */
	name?: string;
	/**
	 * When `true` the component is removable from the canvas, default: `true`
	 * @default true
	 */
	removable?: boolean;
	/**
		 * Indicates if it's possible to drag the component inside others.
		 You can also specify a query string to indentify elements,
		 eg. `'.some-class[title=Hello], [data-gjs-type=column]'` means you can drag the component only inside elements
		 containing `some-class` class and `Hello` title, and `column` components. In the case of a function, target and destination components are passed as arguments, return a Boolean to indicate if the drag is possible. Default: `true`
		 * @default true
		 */
	draggable?: boolean | string | DraggableDroppableFn;
	/**
		 * Indicates if it's possible to drop other components inside. You can use
		a query string as with `draggable`. In the case of a function, target and destination components are passed as arguments, return a Boolean to indicate if the drop is possible. Default: `true`
		 * @default true
		 */
	droppable?: boolean | string | DraggableDroppableFn;
	/**
	 * Set to false if you don't want to see the badge (with the name) over the component. Default: `true`
	 * @default true
	 */
	badgable?: boolean;
	/**
		 * True if it's possible to style the component.
		You can also indicate an array of CSS properties which is possible to style, eg. `['color', 'width']`, all other properties
		will be hidden from the style manager. Default: `true`
		 * @default true
		 */
	stylable?: boolean | String[];
	/**
	 * Indicate an array of style properties which should be hidden from the style manager. Default: `[]`
	 * @default []
	 */
	unstylable?: String[];
	/**
	 * It can be highlighted with 'dotted' borders if true. Default: `true`
	 * @default true
	 */
	highlightable?: boolean;
	/**
	 * True if it's possible to clone the component. Default: `true`
	 * @default true
	 */
	copyable?: boolean;
	/**
	 * Indicates if it's possible to resize the component. It's also possible to pass an object as [options for the Resizer](https://github.com/GrapesJS/grapesjs/blob/master/src/utils/Resizer.ts). Default: `false`
	 */
	resizable?: boolean | ResizerOptions;
	/**
	 * Allow to edit the content of the component (used on Text components). Default: `false`
	 */
	editable?: boolean;
	/**
	 * Set to `false` if you need to hide the component inside Layers. Default: `true`
	 * @default true
	 */
	layerable?: boolean;
	/**
	 * Allow component to be selected when clicked. Default: `true`
	 * @default true
	 */
	selectable?: boolean;
	/**
	 * Shows a highlight outline when hovering on the element if `true`. Default: `true`
	 * @default true
	 */
	hoverable?: boolean;
	/**
	 * Disable the selection of the component and its children in the canvas.
	 * @default false
	 */
	locked?: boolean;
	/**
	 * This property is used by the HTML exporter as void elements don't have closing tags, eg. `<br/>`, `<hr/>`, etc. Default: `false`
	 */
	void?: boolean;
	/**
	 * Component default style, eg. `{ width: '100px', height: '100px', 'background-color': 'red' }`
	 * @default {}
	 */
	style?: any;
	/**
	 * Component related styles, eg. `.my-component-class { color: red }`
	 * @default ''
	 */
	styles?: string;
	/**
	 * Content of the component (not escaped) which will be appended before children rendering. Default: `''`
	 * @default ''
	 */
	content?: string;
	/**
	 * Component's icon, this string will be inserted before the name (in Layers and badge), eg. it can be an HTML string '<i class="fa fa-square-o"></i>'. Default: `''`
	 * @default ''
	 */
	icon?: string;
	/**
	 * Component's javascript. More about it [here](/modules/Components-js.html). Default: `''`
	 * @default ''
	 */
	script?: string | ((...params: any[]) => any);
	/**
	 * Component's traits. More about it [here](/modules/Traits.html). Default: `['id', 'title']`
	 * @default ''
	 */
	traits?: Traits;
	/**
		 * Indicates an array of properties which will be inhereted by all NEW appended children.
		 For example if you create a component likes this: `{ removable: false, draggable: false, propagate: ['removable', 'draggable'] }`
		 and append some new component inside, the new added component will get the exact same properties indicated in the `propagate` array (and the `propagate` property itself). Default: `[]`
		 * @default []
		 */
	propagate?: (keyof ComponentProperties)[];
	/**
	 * Set an array of items to show up inside the toolbar when the component is selected (move, clone, delete).
	 * Eg. `toolbar: [ { attributes: {class: 'fa fa-arrows'}, command: 'tlb-move' }, ... ]`.
	 * By default, when `toolbar` property is falsy the editor will add automatically commands `core:component-exit` (select parent component, added if there is one), `tlb-move` (added if `draggable`) , `tlb-clone` (added if `copyable`), `tlb-delete` (added if `removable`).
	 */
	toolbar?: ToolbarButtonProps[];
	/**
	 * Delegate commands to other components.
	 */
	delegate?: ComponentDelegateProps;
	components?: Components;
	classes?: Selectors;
	dmode?: DragMode;
	"script-props"?: string[];
	[key: string]: any;
}
export interface SymbolToUpOptions {
	changed?: string;
	fromInstance?: boolean;
	noPropagate?: boolean;
	fromUndo?: boolean;
}
export interface ComponentDefinition extends Omit<ComponentProperties, "components" | "traits"> {
	/**
	 * Children components.
	 */
	components?: string | ComponentDefinition | (string | ComponentDefinition)[];
	traits?: (Partial<TraitProperties> | string)[];
	attributes?: Record<string, any>;
	[key: string]: unknown;
}
export interface ComponentDefinitionDefined extends Omit<ComponentProperties, "components" | "traits"> {
	/**
	 * Children components.
	 */
	components?: ComponentDefinitionDefined[] | ComponentDefinitionDefined;
	traits?: (Partial<TraitProperties> | string)[];
	[key: string]: any;
}
export type ComponentAddType = Component | ComponentDefinition | ComponentDefinitionDefined | string;
export type ComponentAdd = ComponentAddType | ComponentAddType[];
export type ToHTMLOptions = {
	/**
	 * Custom tagName.
	 */
	tag?: string;
	/**
	 * Include component properties as `data-gjs-*` attributes. This allows you to have re-importable HTML.
	 */
	withProps?: boolean;
	/**
	 * In case the attribute value contains a `"` char, instead of escaping it (`attr="value &quot;"`), the attribute will be quoted using single quotes (`attr='value "'`).
	 */
	altQuoteAttr?: boolean;
	/**
	 * You can pass an object of custom attributes to replace with the current ones
	 * or you can even pass a function to generate attributes dynamically.
	 */
	attributes?: Record<string, any> | ((component: Component, attr: Record<string, any>) => Record<string, any>);
};
export interface ComponentOptions {
	em?: EditorModel;
	config?: DomComponentsConfig;
	frame?: Frame;
	temporary?: boolean;
	avoidChildren?: boolean;
}
declare class ComponentWrapperView extends ComponentView {
	tagName(): string;
}
export type ComponentEvent = "component:create" | "component:mount" | "component:add" | "component:remove" | "component:remove:before" | "component:clone" | "component:update" | "component:styleUpdate" | "component:selected" | "component:deselected" | "component:toggled" | "component:type:add" | "component:type:update" | "component:drag:start" | "component:drag" | "component:drag:end" | "component:resize";
export interface ComponentModelDefinition extends IComponent {
	defaults?: ComponentDefinition | (() => ComponentDefinition);
	[key: string]: any;
}
export interface ComponentViewDefinition extends IComponentView {
	[key: string]: any;
}
export interface AddComponentTypeOptions {
	isComponent?: (el: HTMLElement) => boolean | ComponentDefinitionDefined | undefined;
	model?: Partial<ComponentModelDefinition> & ThisType<ComponentModelDefinition & Component>;
	view?: Partial<ComponentViewDefinition> & ThisType<ComponentViewDefinition & ComponentView>;
	extend?: string;
	extendView?: string;
	extendFn?: string[];
	extendFnView?: string[];
}
declare enum CanMoveReason {
	/**
	 * Invalid source. This is a default value and should be ignored in case the `result` is true
	 */
	InvalidSource = 0,
	/**
	 * Source doesn't accept target as destination.
	 */
	SourceReject = 1,
	/**
	 * Target doesn't accept source.
	 */
	TargetReject = 2
}
export interface CanMoveResult {
	result: boolean;
	reason: CanMoveReason;
	target: Component;
	source?: Component | null;
}
export declare class ComponentManager extends ItemManagerModule<DomComponentsConfig, any> {
	componentTypes: ComponentStackItem[];
	componentsById: {
		[id: string]: Component;
	};
	componentView?: ComponentWrapperView;
	Component: typeof Component;
	Components: typeof Components;
	ComponentView: typeof ComponentView;
	ComponentsView: typeof ComponentsView;
	/**
	 * Name of the module
	 * @type {String}
	 * @private
	 */
	storageKey: string;
	shallow?: Component;
	/**
	 * Initialize module. Called on a new instance of the editor with configurations passed
	 * inside 'domComponents' field
	 * @param {Object} config Configurations
	 * @private
	 */
	constructor(em: EditorModel);
	load(data: any): any;
	store(): {};
	/**
	 * Returns the main wrapper.
	 * @return {Object}
	 * @private
	 */
	getComponent(): ComponentWrapper | undefined;
	/**
	 * Returns root component inside the canvas. Something like `<body>` inside HTML page
	 * The wrapper doesn't differ from the original Component Model
	 * @return {[Component]} Root Component
	 * @example
	 * // Change background of the wrapper and set some attribute
	 * var wrapper = cmp.getWrapper();
	 * wrapper.set('style', {'background-color': 'red'});
	 * wrapper.set('attributes', {'title': 'Hello!'});
	 */
	getWrapper(): ComponentWrapper | undefined;
	/**
	 * Returns wrapper's children collection. Once you have the collection you can
	 * add other Components(Models) inside. Each component can have several nested
	 * components inside and you can nest them as more as you wish.
	 * @return {Components} Collection of components
	 * @example
	 * // Let's add some component
	 * var wrapperChildren = cmp.getComponents();
	 * var comp1 = wrapperChildren.add({
	 *   style: { 'background-color': 'red'}
	 * });
	 * var comp2 = wrapperChildren.add({
	 *   tagName: 'span',
	 *   attributes: { title: 'Hello!'}
	 * });
	 * // Now let's add an other one inside first component
	 * // First we have to get the collection inside. Each
	 * // component has 'components' property
	 * var comp1Children = comp1.get('components');
	 * // Procede as before. You could also add multiple objects
	 * comp1Children.add([
	 *   { style: { 'background-color': 'blue'}},
	 *   { style: { height: '100px', width: '100px'}}
	 * ]);
	 * // Remove comp2
	 * wrapperChildren.remove(comp2);
	 */
	getComponents(): Components;
	/**
	 * Add new components to the wrapper's children. It's the same
	 * as 'cmp.getComponents().add(...)'
	 * @param {Object|[Component]|Array<Object>} component Component/s to add
	 * @param {string} [component.tagName='div'] Tag name
	 * @param {string} [component.type=''] Type of the component. Available: ''(default), 'text', 'image'
	 * @param {boolean} [component.removable=true] If component is removable
	 * @param {boolean} [component.draggable=true] If is possible to move the component around the structure
	 * @param {boolean} [component.droppable=true] If is possible to drop inside other components
	 * @param {boolean} [component.badgable=true] If the badge is visible when the component is selected
	 * @param {boolean} [component.stylable=true] If is possible to style component
	 * @param {boolean} [component.copyable=true] If is possible to copy&paste the component
	 * @param {string} [component.content=''] String inside component
	 * @param {Object} [component.style={}] Style object
	 * @param {Object} [component.attributes={}] Attribute object
	 * @param {Object} opt the options object to be used by the [Components.add]{@link getComponents} method
	 * @return {[Component]|Array<[Component]>} Component/s added
	 * @example
	 * // Example of a new component with some extra property
	 * var comp1 = cmp.addComponent({
	 *   tagName: 'div',
	 *   removable: true, // Can't remove it
	 *   draggable: true, // Can't move it
	 *   copyable: true, // Disable copy/past
	 *   content: 'Content text', // Text inside component
	 *   style: { color: 'red'},
	 *   attributes: { title: 'here' }
	 * });
	 */
	addComponent(component: ComponentAdd, opt?: AddOptions): Component | Component[];
	/**
	 * Render and returns wrapper element with all components inside.
	 * Once the wrapper is rendered, and it's what happens when you init the editor,
	 * the all new components will be added automatically and property changes are all
	 * updated immediately
	 * @return {HTMLElement}
	 * @private
	 */
	render(): HTMLElement | undefined;
	/**
	 * Remove all components
	 * @return {this}
	 */
	clear(opts?: {}): this;
	/**
	 * Set components
	 * @param {Object|string} components HTML string or components model
	 * @param {Object} opt the options object to be used by the {@link addComponent} method
	 * @return {this}
	 * @private
	 */
	setComponents(components: ComponentAdd, opt?: AddOptions): void;
	/**
	 * Add new component type.
	 * Read more about this in [Define New Component](https://grapesjs.com/docs/modules/Components.html#define-new-component)
	 * @param {string} type Component ID
	 * @param {Object} methods Component methods
	 * @return {this}
	 */
	addType(type: string, methods: AddComponentTypeOptions): this;
	/**
	 * Get component type.
	 * Read more about this in [Define New Component](https://grapesjs.com/docs/modules/Components.html#define-new-component)
	 * @param {string} type Component ID
	 * @return {Object} Component type definition, eg. `{ model: ..., view: ... }`
	 */
	getType(type: "default"): {
		id: string;
		model: any;
		view: any;
	};
	getType(type: string): {
		id: string;
		model: any;
		view: any;
	} | undefined;
	/**
	 * Remove component type
	 * @param {string} type Component ID
	 * @returns {Object|undefined} Removed component type, undefined otherwise
	 */
	removeType(id: string): {
		id: string;
		model: any;
		view: any;
	} | undefined;
	/**
	 * Return the array of all types
	 * @return {Array}
	 */
	getTypes(): ComponentStackItem[];
	selectAdd(component: Component, opts?: {}): void;
	selectRemove(component: Component, opts?: {}): void;
	/**
	 * Triggered when the component is hovered
	 * @private
	 */
	componentHovered(): void;
	getShallowWrapper(): Component | undefined;
	/**
	 * Check if the object is a [Component].
	 * @param {Object} obj
	 * @returns {Boolean}
	 * @example
	 * cmp.isComponent(editor.getSelected()); // true
	 * cmp.isComponent({}); // false
	 */
	isComponent(obj?: ObjectAny): obj is Component;
	/**
	 * Check if a component can be moved inside another one.
	 * @param {[Component]} target The target component is the one that is supposed to receive the source one.
	 * @param {[Component]|String} source The source can be another component, a component definition or an HTML string.
	 * @param {Number} [index] Index position, if not specified, the check will be performed against appending the source to the target.
	 * @returns {Object} Object containing the `result` (Boolean), `source`, `target` (as Components), and a `reason` (Number) with these meanings:
	 * * `0` - Invalid source. This is a default value and should be ignored in case the `result` is true.
	 * * `1` - Source doesn't accept target as destination.
	 * * `2` - Target doesn't accept source.
	 * @example
	 * const rootComponent = editor.getWrapper();
	 * const someComponent = editor.getSelected();
	 *
	 * // Check with two components
	 * editor.Components.canMove(rootComponent, someComponent);
	 *
	 * // Check with component definition
	 * editor.Components.canMove(rootComponent, { tagName: 'a', draggable: false });
	 *
	 * // Check with HTML string
	 * editor.Components.canMove(rootComponent, '<form>...</form>');
	 */
	canMove(target: Component, source?: Component | ComponentDefinition | string, index?: number): CanMoveResult;
	allById(): {
		[id: string]: Component;
	};
	getById(id: string): Component;
	destroy(): void;
}
export interface ComponentsOptions {
	em?: EditorModel;
	config?: DomComponentsConfig;
	domc?: ComponentManager;
}
export declare class Components extends Collection</**
 * Keep this format to avoid errors in TS bundler */ 
/** @ts-ignore */
Component> {
	opt: ComponentsOptions;
	config?: DomComponentsConfig;
	em: EditorModel;
	domc?: ComponentManager;
	parent?: Component;
	__firstAdd?: any;
	initialize(models: any, opt?: ComponentsOptions): void;
	resetChildren(models: Components, opts?: {
		previousModels?: Component[];
		keepIds?: string[];
	}): void;
	resetFromString(input?: string, opts?: {
		visitedCmps?: Record<string, Component[]>;
		keepIds?: string[];
	}): void;
	removeChildren(removed: Component, coll?: Components, opts?: any): void;
	/** @ts-ignore */
	model(attrs: Partial<ComponentProperties>, options: any): Component;
	parseString(value: string, opt?: AddOptions & {
		temporary?: boolean;
		keepIds?: string[];
	}): ComponentDefinitionDefined | ComponentDefinitionDefined[];
	/** @ts-ignore */
	add(models: ComponentAdd, opt?: AddOptions & {
		previousModels?: Component[];
		keepIds?: string[];
	}): any[];
	/**
	 * Process component definition.
	 */
	processDef(mdl: any): any;
	onAdd(model: Component, c?: any, opts?: {
		temporary?: boolean;
	}): void;
}
export interface IComponent extends ExtractMethods<Component> {
}
/**
 * The Component object represents a single node of our template structure, so when you update its properties the changes are
 * immediately reflected on the canvas and in the code to export (indeed, when you ask to export the code we just go through all
 * the tree of nodes).
 * An example on how to update properties:
 * ```js
 * component.set({
 *  tagName: 'span',
 *  attributes: { ... },
 *  removable: false,
 * });
 * component.get('tagName');
 * // -> 'span'
 * ```
 *
 * [Component]: component.html
 *
 * @property {String} [type=''] Component type, eg. `text`, `image`, `video`, etc.
 * @property {String} [tagName='div'] HTML tag of the component, eg. `span`. Default: `div`
 * @property {Object} [attributes={}] Key-value object of the component's attributes, eg. `{ title: 'Hello' }` Default: `{}`
 * @property {String} [name=''] Name of the component. Will be used, for example, in Layers and badges
 * @property {Boolean} [removable=true] When `true` the component is removable from the canvas, default: `true`
 * @property {Boolean|String|Function} [draggable=true] Indicates if it's possible to drag the component inside others.
 *  You can also specify a query string to indentify elements,
 *  eg. `'.some-class[title=Hello], [data-gjs-type=column]'` means you can drag the component only inside elements
 *  containing `some-class` class and `Hello` title, and `column` components. In the case of a function, target and destination components are passed as arguments, return a Boolean to indicate if the drag is possible. Default: `true`
 * @property {Boolean|String|Function} [droppable=true] Indicates if it's possible to drop other components inside. You can use
 * a query string as with `draggable`. In the case of a function, target and destination components are passed as arguments, return a Boolean to indicate if the drop is possible. Default: `true`
 * @property {Boolean} [badgable=true] Set to false if you don't want to see the badge (with the name) over the component. Default: `true`
 * @property {Boolean|Array<String>} [stylable=true] True if it's possible to style the component.
 * You can also indicate an array of CSS properties which is possible to style, eg. `['color', 'width']`, all other properties
 * will be hidden from the style manager. Default: `true`
 * @property {Array<String>} [stylable-require=[]] Indicate an array of style properties to show up which has been marked as `toRequire`. Default: `[]`
 * @property {Array<String>} [unstylable=[]] Indicate an array of style properties which should be hidden from the style manager. Default: `[]`
 * @property {Boolean} [highlightable=true] It can be highlighted with 'dotted' borders if true. Default: `true`
 * @property {Boolean} [copyable=true] True if it's possible to clone the component. Default: `true`
 * @property {Boolean} [resizable=false] Indicates if it's possible to resize the component. It's also possible to pass an object as [options for the Resizer](https://github.com/GrapesJS/grapesjs/blob/master/src/utils/Resizer.ts). Default: `false`
 * @property {Boolean} [editable=false] Allow to edit the content of the component (used on Text components). Default: `false`
 * @property {Boolean} [layerable=true] Set to `false` if you need to hide the component inside Layers. Default: `true`
 * @property {Boolean} [selectable=true] Allow component to be selected when clicked. Default: `true`
 * @property {Boolean} [hoverable=true] Shows a highlight outline when hovering on the element if `true`. Default: `true`
 * @property {Boolean} [locked] Disable the selection of the component and its children in the canvas. You can unlock a children by setting its locked property to `false`. Default: `undefined`
 * @property {Boolean} [void=false] This property is used by the HTML exporter as void elements don't have closing tags, eg. `<br/>`, `<hr/>`, etc. Default: `false`
 * @property {Object} [style={}] Component default style, eg. `{ width: '100px', height: '100px', 'background-color': 'red' }`
 * @property {String} [styles=''] Component related styles, eg. `.my-component-class { color: red }`
 * @property {String} [content=''] Content of the component (not escaped) which will be appended before children rendering. Default: `''`
 * @property {String} [icon=''] Component's icon, this string will be inserted before the name (in Layers and badge), eg. it can be an HTML string '<i class="fa fa-square-o"></i>'. Default: `''`
 * @property {String|Function} [script=''] Component's javascript. More about it [here](/modules/Components-js.html). Default: `''`
 * @property {String|Function} [script-export=''] You can specify javascript available only in export functions (eg. when you get the HTML).
 * If this property is defined it will overwrite the `script` one (in export functions). Default: `''`
 * @property {Array<Object|String>} [traits=''] Component's traits. More about it [here](/modules/Traits.html). Default: `['id', 'title']`
 * @property {Array<String>} [propagate=[]] Indicates an array of properties which will be inhereted by all NEW appended children.
 *  For example if you create a component likes this: `{ removable: false, draggable: false, propagate: ['removable', 'draggable'] }`
 *  and append some new component inside, the new added component will get the exact same properties indicated in the `propagate` array (and the `propagate` property itself). Default: `[]`
 * @property {Array<Object>} [toolbar=null] Set an array of items to show up inside the toolbar when the component is selected (move, clone, delete).
 * Eg. `toolbar: [ { attributes: {class: 'fa fa-arrows'}, command: 'tlb-move' }, ... ]`.
 * By default, when `toolbar` property is falsy the editor will add automatically commands `core:component-exit` (select parent component, added if there is one), `tlb-move` (added if `draggable`) , `tlb-clone` (added if `copyable`), `tlb-delete` (added if `removable`).
 * @property {Collection<Component>} [components=null] Children components. Default: `null`
 * @property {Object} [delegate=null] Delegate commands to other components. Available commands `remove` | `move` | `copy` | `select`. eg. `{ remove: (cmp) => cmp.closestType('other-type') }`
 *
 * @module docsjs.Component
 */
export declare class Component extends StyleableModel<ComponentProperties> {
	/**
	 * @private
	 * @ts-ignore */
	get defaults(): ComponentDefinitionDefined;
	get classes(): Selectors;
	get traits(): Traits;
	get content(): string;
	get toolbar(): ToolbarButtonProps[];
	get resizable(): boolean | ResizerOptions;
	get delegate(): ComponentDelegateProps | undefined;
	get locked(): boolean | undefined;
	/**
	 * Hook method, called once the model is created
	 */
	init(): void;
	/**
	 * Hook method, called when the model has been updated (eg. updated some model's property)
	 * @param {String} property Property name, if triggered after some property update
	 * @param {*} value Property value, if triggered after some property update
	 * @param {*} previous Property previous value, if triggered after some property update
	 */
	updated(property: string, value: any, previous: any): void;
	/**
	 * Hook method, called once the model has been removed
	 */
	removed(): void;
	em: EditorModel;
	opt: ComponentOptions;
	config: DomComponentsConfig;
	ccid: string;
	views: ComponentView[];
	view?: ComponentView;
	frame?: Frame;
	rule?: CssRule;
	prevColl?: Components;
	__hasUm?: boolean;
	__symbReady?: boolean;
	/**
	 * @private
	 * @ts-ignore */
	collection: Components;
	initialize(props?: {}, opt?: ComponentOptions): void;
	__postAdd(opts?: {
		recursive?: boolean;
	}): void;
	__postRemove(): void;
	__onChange(m: any, opts: any): void;
	__onStyleChange(newStyles: StyleProps): void;
	__changesUp(opts: any): void;
	__propSelfToParent(props: any): void;
	__propToParent(props: any): void;
	__emitUpdateTlb(): void;
	/**
	 * Check component's type
	 * @param  {string}  type Component type
	 * @return {Boolean}
	 * @example
	 * component.is('image')
	 * // -> false
	 */
	is(type: string): boolean;
	/**
	 * Return all the propeties
	 * @returns {Object}
	 */
	props(): Partial<ComponentProperties>;
	/**
	 * Get the index of the component in the parent collection.
	 * @return {Number}
	 */
	index(): number;
	/**
	 * Change the drag mode of the component.
	 * To get more about this feature read: https://github.com/GrapesJS/grapesjs/issues/1936
	 * @param {String} value Drag mode, options: `'absolute'` | `'translate'` | `''`
	 * @returns {this}
	 */
	setDragMode(value?: DragMode): this;
	/**
	 * Get the drag mode of the component.
	 * @returns {String} Drag mode value, options: `'absolute'` | `'translate'` | `''`
	 */
	getDragMode(): DragMode;
	/**
	 * Find inner components by query string.
	 * **ATTENTION**: this method works only with already rendered component
	 * @param  {String} query Query string
	 * @return {Array} Array of components
	 * @example
	 * component.find('div > .class');
	 * // -> [Component, Component, ...]
	 */
	find(query: string): Component[];
	/**
	 * Find all inner components by component type.
	 * The advantage of this method over `find` is that you can use it
	 * also before rendering the component
	 * @param {String} type Component type
	 * @returns {Array<Component>}
	 * @example
	 * const allImages = component.findType('image');
	 * console.log(allImages[0]) // prints the first found component
	 */
	findType(type: string): Component[];
	/**
	 * Find the closest parent component by query string.
	 * **ATTENTION**: this method works only with already rendered component
	 * @param  {string} query Query string
	 * @return {Component}
	 * @example
	 * component.closest('div.some-class');
	 * // -> Component
	 */
	closest(query: string): Component | undefined;
	/**
	 * Find the closest parent component by its type.
	 * The advantage of this method over `closest` is that you can use it
	 * also before rendering the component
	 * @param {String} type Component type
	 * @returns {Component} Found component, otherwise `undefined`
	 * @example
	 * const Section = component.closestType('section');
	 * console.log(Section);
	 */
	closestType(type: string): Component | undefined;
	/**
	 * The method returns a Boolean value indicating whether the passed
	 * component is a descendant of a given component
	 * @param {Component} component Component to check
	 * @returns {Boolean}
	 */
	contains(component: Component): boolean;
	/**
	 * Once the tag is updated I have to rerender the element
	 * @private
	 */
	tagUpdated(): void;
	/**
	 * Replace a component with another one
	 * @param {String|Component} el Component or HTML string
	 * @param {Object} [opts={}] Options for the append action
	 * @returns {Array<Component>} New replaced components
	 * @example
	 * const result = component.replaceWith('<div>Some new content</div>');
	 * // result -> [Component]
	 */
	replaceWith<C extends Component = Component>(el: ComponentAdd, opts?: AddOptions): C[];
	/**
	 * Emit changes for each updated attribute
	 * @private
	 */
	attrUpdated(m: any, v: any, opts?: any): void;
	/**
	 * Update attributes of the component
	 * @param {Object} attrs Key value attributes
	 * @param {Object} options Options for the model update
	 * @return {this}
	 * @example
	 * component.setAttributes({ id: 'test', 'data-key': 'value' });
	 */
	setAttributes(attrs: ObjectAny, opts?: SetOptions): this;
	/**
	 * Add attributes to the component
	 * @param {Object} attrs Key value attributes
	 * @param {Object} options Options for the model update
	 * @return {this}
	 * @example
	 * component.addAttributes({ 'data-key': 'value' });
	 */
	addAttributes(attrs: ObjectAny, opts?: SetOptions): this;
	/**
	 * Remove attributes from the component
	 * @param {String|Array<String>} attrs Array of attributes to remove
	 * @param {Object} options Options for the model update
	 * @return {this}
	 * @example
	 * component.removeAttributes('some-attr');
	 * component.removeAttributes(['some-attr1', 'some-attr2']);
	 */
	removeAttributes(attrs?: string | string[], opts?: SetOptions): this;
	/**
	 * Get the style of the component
	 * @return {Object}
	 */
	getStyle(options?: any, optsAdd?: any): StyleProps;
	/**
	 * Set the style on the component
	 * @param {Object} prop Key value style object
	 * @return {Object}
	 * @example
	 * component.setStyle({ color: 'red' });
	 */
	setStyle(prop?: StyleProps, opts?: any): StyleProps;
	/**
	 * Return all component's attributes
	 * @return {Object}
	 */
	getAttributes(opts?: {
		noClass?: boolean;
		noStyle?: boolean;
	}): {
		[x: string]: any;
	};
	/**
	 * Add classes
	 * @param {Array<String>|String} classes Array or string of classes
	 * @return {Array} Array of added selectors
	 * @example
	 * model.addClass('class1');
	 * model.addClass('class1 class2');
	 * model.addClass(['class1', 'class2']);
	 * // -> [SelectorObject, ...]
	 */
	addClass(classes: string | string[]): Selector;
	/**
	 * Set classes (resets current collection)
	 * @param {Array<String>|String} classes Array or string of classes
	 * @return {Array} Array of added selectors
	 * @example
	 * model.setClass('class1');
	 * model.setClass('class1 class2');
	 * model.setClass(['class1', 'class2']);
	 * // -> [SelectorObject, ...]
	 */
	setClass(classes: string | string[]): Selector;
	/**
	 * Remove classes
	 * @param {Array<String>|String} classes Array or string of classes
	 * @return {Array} Array of removed selectors
	 * @example
	 * model.removeClass('class1');
	 * model.removeClass('class1 class2');
	 * model.removeClass(['class1', 'class2']);
	 * // -> [SelectorObject, ...]
	 */
	removeClass(classes: string | string[]): Selector[];
	/**
	 * Returns component's classes as an array of strings
	 * @return {Array}
	 */
	getClasses(): any;
	__logSymbol(type: string, toUp: Component[], opts?: any): void;
	__initSymb(): void;
	__isSymbol(): boolean;
	__isSymbolOrInst(): boolean;
	__isSymbolTop(): boolean;
	__isSymbolNested(): boolean;
	__getAllById(): {
		[id: string]: Component;
	};
	__getSymbol(): Component | undefined;
	__getSymbols(): Component[] | undefined;
	__isSymbOvrd(prop?: string): boolean;
	__getSymbToUp(opts?: SymbolToUpOptions): Component[];
	__getSymbTop(opts?: any): Component;
	__upSymbProps(m: any, opts?: SymbolToUpOptions): void;
	__upSymbCls(m: any, c: any, opts?: {}): void;
	__upSymbComps(m: Component, c: Components, o: any): void;
	initClasses(m?: any, c?: any, opts?: any): this;
	initComponents(): this;
	initTraits(changed?: any): this;
	initScriptProps(): void;
	__scriptPropsChange(m: any, v: any, opts?: any): void;
	/**
	 * Add new component children
	 * @param  {Component|String} components Component to add
	 * @param {Object} [opts={}] Options for the append action
	 * @return {Array} Array of appended components
	 * @example
	 * someComponent.get('components').length // -> 0
	 * const videoComponent = someComponent.append('<video></video><div></div>')[0];
	 * // This will add 2 components (`video` and `div`) to your `someComponent`
	 * someComponent.get('components').length // -> 2
	 * // You can pass components directly
	 * otherComponent.append(otherComponent2);
	 * otherComponent.append([otherComponent3, otherComponent4]);
	 * // append at specific index (eg. at the beginning)
	 * someComponent.append(otherComponent, { at: 0 });
	 */
	append(components: ComponentAdd, opts?: AddOptions): Component[];
	/**
	 * Set new collection if `components` are provided, otherwise the
	 * current collection is returned
	 * @param  {Component|Component[]|String} [components] Component Definitions or HTML string
	 * @param {Object} [opts={}] Options, same as in `Component.append()`
	 * @returns {Collection|Array<[Component]>}
	 * @example
	 * // Set new collection
	 * component.components('<span></span><div></div>');
	 * // Get current collection
	 * const collection = component.components();
	 * console.log(collection.length);
	 * // -> 2
	 */
	components<T extends ComponentAdd | undefined>(components?: T, opts?: any): undefined extends T ? Components : Component[];
	/**
	 * If exists, returns the child component at specific index.
	 * @param {Number} index Index of the component to return
	 * @returns {[Component]|null}
	 * @example
	 * // Return first child
	 * component.getChildAt(0);
	 * // Return second child
	 * component.getChildAt(1);
	 */
	getChildAt(index: number): Component;
	/**
	 * If exists, returns the last child component.
	 * @returns {[Component]|null}
	 * @example
	 * const lastChild = component.getLastChild();
	 */
	getLastChild(): Component;
	/**
	 * Remove all inner components
	 * * @return {this}
	 */
	empty(opts?: {}): this;
	/**
	 * Get the parent component, if exists
	 * @return {Component|null}
	 * @example
	 * component.parent();
	 * // -> Component
	 */
	parent(opts?: any): Component | undefined;
	/**
	 * Return all parents of the component.
	 * @returns {Array<Component>}
	 */
	parents(): Component[];
	/**
	 * Script updated
	 * @private
	 */
	scriptUpdated(): void;
	/**
	 * Init toolbar
	 * @private
	 */
	initToolbar(): void;
	__loadTraits(tr?: Traits | TraitProperties[], opts?: {}): this;
	/**
	 * Get traits.
	 * @returns {Array<Trait>}
	 * @example
	 * const traits = component.getTraits();
	 * console.log(traits);
	 * // [Trait, Trait, Trait, ...]
	 */
	getTraits(): Trait[];
	/**
	 * Replace current collection of traits with a new one.
	 * @param {Array<Object>} traits Array of trait definitions
	 * @returns {Array<Trait>}
	 * @example
	 * const traits = component.setTraits([{ type: 'checkbox', name: 'disabled'}, ...]);
	 * console.log(traits);
	 * // [Trait, ...]
	 */
	setTraits(traits: TraitProperties[]): Trait[];
	/**
	 * Get the trait by id/name.
	 * @param  {String} id The `id` or `name` of the trait
	 * @return {Trait|null} Trait getModelToStyle
	 * @example
	 * const traitTitle = component.getTrait('title');
	 * traitTitle && traitTitle.set('label', 'New label');
	 */
	getTrait(id: string): Trait;
	/**
	 * Update a trait.
	 * @param  {String} id The `id` or `name` of the trait
	 * @param  {Object} props Object with the props to update
	 * @return {this}
	 * @example
	 * component.updateTrait('title', {
	 *  type: 'select',
	 *  options: [ 'Option 1', 'Option 2' ],
	 * });
	 */
	updateTrait(id: string, props: Partial<TraitProperties>): this;
	/**
	 * Get the trait position index by id/name. Useful in case you want to
	 * replace some trait, at runtime, with something else.
	 * @param  {String} id The `id` or `name` of the trait
	 * @return {Number} Index position of the current trait
	 * @example
	 * const traitTitle = component.getTraitIndex('title');
	 * console.log(traitTitle); // 1
	 */
	getTraitIndex(id: string): number;
	/**
	 * Remove trait/s by id/s.
	 * @param  {String|Array<String>} id The `id`/`name` of the trait (or an array)
	 * @return {Array<Trait>} Array of removed traits
	 * @example
	 * component.removeTrait('title');
	 * component.removeTrait(['title', 'id']);
	 */
	removeTrait(id: string | string[]): Trait[];
	/**
	 * Add new trait/s.
	 * @param  {String|Object|Array<String|Object>} trait Trait to add (or an array of traits)
	 * @param  {Options} opts Options for the add
	 * @return {Array<Trait>} Array of added traits
	 * @example
	 * component.addTrait('title', { at: 1 }); // Add title trait (`at` option is the position index)
	 * component.addTrait({
	 *  type: 'checkbox',
	 *  name: 'disabled',
	 * });
	 * component.addTrait(['title', {...}, ...]);
	 */
	addTrait(trait: Parameters<Traits["add"]>[0], opts?: AddOptions): Trait[];
	/**
	 * Normalize input classes from array to array of objects
	 * @param {Array} arr
	 * @return {Array}
	 * @private
	 */
	normalizeClasses(arr: string[]): Selector[];
	/**
	 * Override original clone method
	 * @private
	 */
	clone(opt?: {
		symbol?: boolean;
		symbolInv?: boolean;
	}): any;
	/**
	 * Get the name of the component.
	 * @param {Object} [opts={}] Options
	 * @param {Boolean} [opts.noCustom] Avoid custom name assigned to the component.
	 * @returns {String}
	 * */
	getName(opts?: {
		noCustom?: boolean;
	}): any;
	/**
	 * Get the icon string
	 * @return {String}
	 */
	getIcon(): string;
	/**
	 * Return HTML string of the component
	 * @param {Object} [opts={}] Options
	 * @param {String} [opts.tag] Custom tagName
	 * @param {Object|Function} [opts.attributes=null] You can pass an object of custom attributes to replace with the current ones or you can even pass a function to generate attributes dynamically.
	 * @param {Boolean} [opts.withProps] Include component properties as `data-gjs-*` attributes. This allows you to have re-importable HTML.
	 * @param {Boolean} [opts.altQuoteAttr] In case the attribute value contains a `"` char, instead of escaping it (`attr="value &quot;"`), the attribute will be quoted using single quotes (`attr='value "'`).
	 * @return {String} HTML string
	 * @example
	 * // Simple HTML return
	 * component.set({ tagName: 'span' });
	 * component.setAttributes({ title: 'Hello' });
	 * component.toHTML();
	 * // -> <span title="Hello"></span>
	 *
	 * // Custom attributes
	 * component.toHTML({ attributes: { 'data-test': 'Hello' } });
	 * // -> <span data-test="Hello"></span>
	 *
	 * // Custom dynamic attributes
	 * component.toHTML({
	 *  attributes(component, attributes) {
	 *    if (component.get('tagName') == 'span') {
	 *      attributes.title = 'Custom attribute';
	 *    }
	 *    return attributes;
	 *  },
	 * });
	 * // -> <span title="Custom attribute"></span>
	 */
	toHTML(opts?: ToHTMLOptions): string;
	/**
	 * Get inner HTML of the component
	 * @param {Object} [opts={}] Same options of `toHTML`
	 * @returns {String} HTML string
	 */
	getInnerHTML(opts?: ToHTMLOptions): string;
	__innerHTML(opts?: ToHTMLOptions): string;
	/**
	 * Returns object of attributes for HTML
	 * @return {Object}
	 * @private
	 */
	getAttrToHTML(): {
		[x: string]: any;
	};
	/**
	 * Return a shallow copy of the model's attributes for JSON
	 * stringification.
	 * @return {Object}
	 * @private
	 */
	toJSON(opts?: ObjectAny): ComponentDefinition;
	/**
	 * Return an object containing only changed props
	 */
	getChangedProps(res: Partial<ComponentDefinition>): Partial<ComponentDefinition>;
	/**
	 * Return the component id
	 * @return {String}
	 */
	getId(): string;
	/**
	 * Set new id on the component
	 * @param {String} id
	 * @return {this}
	 */
	setId(id: string, opts?: SetOptions & {
		idUpdate?: boolean;
	}): this;
	/**
	 * Get the DOM element of the component.
	 * This works only if the component is already rendered
	 * @param {Frame} frame Specific frame from which taking the element
	 * @return {HTMLElement}
	 */
	getEl(frame?: Frame): HTMLElement | undefined;
	/**
	 * Get the View of the component.
	 * This works only if the component is already rendered
	 * @param {Frame} frame Get View of a specific frame
	 * @return {ComponentView}
	 */
	getView(frame?: Frame): ComponentView<Component> | undefined;
	getCurrentView(): ComponentView<Component> | undefined;
	__getScriptProps(): Partial<ComponentProperties>;
	/**
	 * Return script in string format, cleans 'function() {..' from scripts
	 * if it's a function
	 * @param {string|Function} script
	 * @return {string}
	 * @private
	 */
	getScriptString(script?: string | Function): string;
	emitUpdate(property?: string, ...args: any[]): void;
	/**
	 * Execute callback function on itself and all inner components
	 * @param  {Function} clb Callback function, the model is passed as an argument
	 * @return {this}
	 * @example
	 * component.onAll(component => {
	 *  // do something with component
	 * })
	 */
	onAll(clb: (cmp: Component) => void): this;
	/**
	 * Execute a callback function on all inner child components.
	 * @param  {Function} clb Callback function, the child component is passed as an argument
	 * @example
	 * component.forEachChild(child => {
	 *  console.log(child)
	 * })
	 */
	forEachChild(clb: (child: Component) => void): void;
	/**
	 * Remove the component
	 * @return {this}
	 */
	remove(opts?: any): this;
	/**
	 * Move the component to another destination component
	 * @param {Component} component Destination component (so the current one will be appended as a child)
	 * @param {Object} opts Options for the append action
	 * @returns {this}
	 * @example
	 * // Move the selected component on top of the wrapper
	 * const dest = editor.getWrapper();
	 * editor.getSelected().move(dest, { at: 0 });
	 */
	move(component: Component, opts?: AddOptions): this;
	/**
	 * Check if the component is an instance of some component type.
	 * @param {String} type Component type
	 * @returns {Boolean}
	 * @example
	 * // Add a new component type by extending an existing one
	 * editor.Components.addType('text-ext', { extend: 'text' });
	 * // Append a new component somewhere
	 * const newTextExt = editor.getSelected().append({ type: 'text-ext' })[0];
	 * newTextExt.isInstanceOf('text-ext'); // true
	 * newTextExt.isInstanceOf('text'); // true
	 */
	isInstanceOf(type: string): boolean;
	/**
	 * Check if the component is a child of some other component (or component type)
	 * @param {[Component]|String} component Component parent to check. In case a string is passed,
	 *  the check will be performed on the component type.
	 * @returns {Boolean}
	 * @example
	 * const newTextComponent = editor.getSelected().append({
	 *  type: 'text',
	 *  components: 'My text <b>here</b>',
	 * })[0];
	 * const innerComponent = newTextComponent.find('b')[0];
	 * innerComponent.isChildOf(newTextComponent); // true
	 * innerComponent.isChildOf('text'); // true
	 */
	isChildOf(component: string | Component): boolean;
	/**
	 * Reset id of the component and any of its style rule
	 * @param {Object} [opts={}] Options
	 * @return {this}
	 * @private
	 */
	resetId(opts?: {}): this;
	_getStyleRule({ id }?: {
		id?: string;
	}): CssRule | undefined;
	_getStyleSelector(opts?: {
		id?: string;
	}): Selector | undefined;
	_idUpdated(m: any, v: any, opts?: {
		idUpdate?: boolean;
	}): this | undefined;
	static getDefaults(): any;
	static isComponent(el: HTMLElement): ComponentDefinitionDefined | boolean | undefined;
	static ensureInList(model: Component): void;
	static createId(model: Component, opts?: any): string;
	static getNewId(list: ObjectAny): string;
	static getIncrementId(id: string, list: ObjectAny, opts?: {
		keepIds?: string[];
	}): string;
	static getList(model: Component): any;
	static checkId(components: ComponentDefinitionDefined | ComponentDefinitionDefined[], styles?: CssRuleJSON[], list?: ObjectAny, opts?: {
		keepIds?: string[];
		idMap?: PrevToNewIdMap;
	}): void;
}
declare class Selectable extends Model {
}
declare class Selected extends Collection<Selectable> {
	getByComponent(component: Component): Selectable;
	addComponent(component: Component, opts: any): Selectable;
	getComponent(model: Selectable): Component;
	hasComponent(component: Component): boolean;
	lastComponent(): Component | undefined;
	allComponents(): Component[];
	removeComponent(component: Component | Component[], opts: any): Selectable;
}
declare class EditorView extends View<EditorModel> {
	constructor(model: EditorModel);
	render(): this;
}
export interface AssetManagerConfig {
	/**
	 * Default assets.
	 * @example
	 * [
	 *  'https://...image1.png',
	 *  'https://...image2.png',
	 *  {type: 'image', src: 'https://...image3.png', someOtherCustomProp: 1}
	 * ]
	 */
	assets?: (string | Record<string, any>)[];
	/**
	 * Content to add where there is no assets to show.
	 * @default ''
	 * @example 'No <b>assets</b> here, drag to upload'
	 */
	noAssets?: string;
	/**
	 * Style prefix
	 * @default 'am-'
	 */
	stylePrefix?: string;
	/**
	 * Upload endpoint, set `false` to disable upload.
	 * @example 'https://endpoint/upload/assets'
	 */
	upload?: false | string;
	/**
	 * The name used in POST to pass uploaded files.
	 * @default 'files'
	 */
	uploadName?: string;
	/**
	 * Custom headers to pass with the upload request.
	 * @default {}
	 */
	headers?: Record<string, any>;
	/**
	 * Custom parameters to pass with the upload request, eg. csrf token.
	 * @default {}
	 */
	params?: Record<string, any>;
	/**
	 * The credentials setting for the upload request, eg. 'include', 'omit'.
	 * @default 'include'
	 */
	credentials?: RequestCredentials;
	/**
	 * Allow uploading multiple files per request. If disabled filename will not have the 'multiUploadSuffix' appended.
	 * @default true
	 */
	multiUpload?: boolean;
	/**
	 * The suffix to append to 'uploadName' when 'multiUpload' is true.
	 * @default '[]'
	 */
	multiUploadSuffix?: string;
	/**
	 * If true, tries to add automatically uploaded assets. To make it work the server should respond with a JSON containing assets in a data key, eg:
	 * { data: [ 'https://.../image.png', {src: 'https://.../image2.png'} ]
	 * @default true
	 */
	autoAdd?: boolean;
	/**
	 * Customize the options passed to the default Fetch API.
	 * @example
	 * fetchOptions: (options) => ({ ...options, method: 'put' }),
	 */
	fetchOptions?: (options: RequestInit) => RequestInit;
	/**
	 * To upload your assets, the module uses Fetch API. With this option you can overwrite it with your own logic. The custom function should return a Promise.
	 * @example
	 * customFetch: (url, options) => axios(url, { data: options.body }),
	 */
	customFetch?: (url: string, options: Record<string, any>) => Promise<void>;
	/**
	 * Custom uploadFile function.
	 * Differently from the `customFetch` option, this gives a total control over the uploading process, but you also have to emit all `asset:upload:*` events b
	 * y yourself (if you need to use them somewhere).
	 * @example
	 * uploadFile: (ev) => {
	 *  const files = ev.dataTransfer ? ev.dataTransfer.files : ev.target.files;
	 *  // ...send somewhere
	 * }
	 */
	uploadFile?: (ev: DragEvent) => void;
	/**
	 * In the absence of 'uploadFile' or 'upload' assets will be embedded as Base64.
	 * @default true
	 */
	embedAsBase64?: boolean;
	/**
	 * Handle the image url submit from the built-in 'Add image' form.
	 * @example
	 * handleAdd: (textFromInput) => {
	 *   // some check...
	 *   editor.AssetManager.add(textFromInput);
	 * }
	 */
	handleAdd?: (value: string) => void;
	/**
	 * Method called before upload, on return false upload is canceled.
	 * @example
	 * beforeUpload: (files) => {
	 *  // logic...
	 *  const stopUpload = true;
	 *  if(stopUpload) return false;
	 * }
	 */
	beforeUpload?: (files: any) => void | false;
	/**
	 * Toggles visiblity of assets url input
	 * @default true
	 */
	showUrlInput?: boolean;
	/**
	 * Avoid rendering the default asset manager.
	 * @default false
	 */
	custom?: boolean | {
		open?: (props: any) => void;
		close?: (props: any) => void;
	};
	/**
	 * Enable an upload dropzone on the entire editor (not document) when dragging files over it.
	 * If active the dropzone disable/hide the upload dropzone in asset modal, otherwise you will get double drops (#507).
	 * @deprecated
	 */
	dropzone?: boolean;
	/**
	 * Open the asset manager once files are been dropped via the dropzone.
	 * @deprecated
	 */
	openAssetsOnDrop?: boolean;
	/**
	 * Any dropzone content to append inside dropzone element
	 * @deprecated
	 */
	dropzoneContent?: string;
}
export declare class Blocks extends CollectionWithCategories<Block> {
	em: EditorModel;
	constructor(coll: any[], options: {
		em: EditorModel;
	});
	getCategories(): Categories;
	handleAdd(model: Block): void;
}
/** @private */
export interface BlockProperties {
	/**
	 * Block label, eg. `My block`
	 */
	label: string;
	/**
	 * The content of the block. Might be an HTML string or a [Component Defintion](/modules/Components.html#component-definition)
	 */
	content: string | ComponentDefinition;
	/**
	 * HTML string for the media/icon of the block, eg. `<svg ...`, `<img ...`, etc.
	 * @default ''
	 */
	media?: string;
	/**
	 * Block category, eg. `Basic blocks`
	 * @default ''
	 */
	category?: string | CategoryProperties;
	/**
	 * If true, triggers the `active` event on the dropped component.
	 * @default false
	 */
	activate?: boolean;
	/**
	 * If true, the dropped component will be selected.
	 * @default false
	 */
	select?: boolean;
	/**
	 * If true, all IDs of dropped components and their styles will be changed.
	 * @default false
	 */
	resetId?: boolean;
	/**
	 * Disable the block from being interacted.
	 * @default false
	 */
	disable?: boolean;
	/**
	 * Custom behavior on click.
	 * @example
	 * onClick: (block, editor) => editor.getWrapper().append(block.get('content'))
	 */
	onClick?: (block: Block, editor: Editor) => void;
	/**
	 * Block attributes
	 */
	attributes?: Record<string, any>;
	id?: string;
	/**
	 * @deprecated
	 */
	activeOnRender?: boolean;
}
/**
 * @property {String} label Block label, eg. `My block`
 * @property {String|Object} content The content of the block. Might be an HTML string or a [Component Defintion](/modules/Components.html#component-definition)
 * @property {String} [media=''] HTML string for the media/icon of the block, eg. `<svg ...`, `<img ...`, etc.
 * @property {String} [category=''] Block category, eg. `Basic blocks`
 * @property {Boolean} [activate=false] If true, triggers the `active` event on the dropped component.
 * @property {Boolean} [select=false] If true, the dropped component will be selected.
 * @property {Boolean} [resetId=false] If true, all IDs of dropped components and their styles will be changed.
 * @property {Boolean} [disable=false] Disable the block from being interacted
 * @property {Function} [onClick] Custom behavior on click, eg. `(block, editor) => editor.getWrapper().append(block.get('content'))`
 * @property {Object} [attributes={}] Block attributes to apply in the view element
 *
 * @module docsjs.Block
 */
export declare class Block extends Model<BlockProperties> {
	defaults(): {
		label: string;
		content: string;
		media: string;
		category: string;
		activate: boolean;
		select: undefined;
		resetId: boolean;
		disable: boolean;
		onClick: undefined;
		attributes: {};
	};
	get category(): Category | undefined;
	get parent(): Blocks;
	/**
	 * Get block id
	 * @returns {String}
	 */
	getId(): string;
	/**
	 * Get block label
	 * @returns {String}
	 */
	getLabel(): string;
	/**
	 * Get block media
	 * @returns {String}
	 */
	getMedia(): string | undefined;
	/**
	 * Get block content
	 * @returns {Object|String|Array<Object|String>}
	 */
	getContent(): string | ComponentDefinition | undefined;
	/**
	 * Get block category label
	 * @returns {String}
	 */
	getCategoryLabel(): string;
}
export interface BlockManagerConfig {
	/**
	 * Specify the element to use as a container, string (query) or HTMLElement.
	 * With the empty value, nothing will be rendered.
	 * @default ''
	 */
	appendTo?: HTMLElement | string;
	/**
	 * Default blocks.
	 * @default []
	 */
	blocks?: BlockProperties[];
	/**
	 * Append blocks to canvas on click.
	 * With the `true` value, it will try to append the block to the selected component
	 * If there is no selected component, the block will be appened to the wrapper.
	 * You can also pass a function to this option, use it as a catch-all for all block
	 * clicks and implement a custom logic for each block.
	 * @default false
	 * @example
	 * // Example with a function
	 * appendOnClick: (block, editor) => {
	 *  if (block.get('id') === 'some-id')
	 *    editor.getSelected().append(block.get('content'))
	 *  else
	 *    editor.getWrapper().append(block.get('content'))
	 * }
	 */
	appendOnClick?: boolean | ((block: Block, editor: Editor, opts: {
		event: Event;
	}) => void);
	/**
	 * Avoid rendering the default block manager UI.
	 * More about it here: https://grapesjs.com/docs/modules/Blocks.html#customization
	 * @default false
	 */
	custom?: boolean;
}
export interface CodeManagerConfig {
	/**
	 * Style prefix.
	 * @default 'cm-'
	 */
	stylePrefix?: string;
	/**
	 * Pass default options to code viewer
	 * @default {}
	 */
	optsCodeViewer?: Record<string, any>;
}
/** @private */
export interface DeviceProperties {
	id?: string;
	/**
	 * Device name.
	 * @example 'Mobile'
	 */
	name: string;
	/**
	 * Width to set for the editor iframe.
	 * @example '900px'
	 */
	width: string | null;
	/**
	 * Height to set for the editor iframe.
	 * @example '600px'
	 */
	height?: string;
	/**
	 * The width which will be used in media queries, if empty the `width` will be used.
	 * @example '900px'
	 */
	widthMedia?: string | null;
	/**
	 * Setup the order of media queries
	 * @example 1
	 */
	priority?: number | null;
}
/**
 * @typedef Device
 * @property {String} [name=''] Device type, eg. `Mobile`
 * @property {String} [width] Width to set for the editor iframe, eg. '900px'
 * @property {String} [height=''] Height to set for the editor iframe, eg. '600px'
 * @property {String} [widthMedia=''] The width which will be used in media queries, If empty the width will be used
 * @property {Number} [priority=null] Setup the order of media queries
 */
export declare class Device extends Model<DeviceProperties> {
	defaults(): {
		name: string;
		width: null;
		height: string;
		widthMedia: null;
		priority: null;
	};
	initialize(): void;
	checkUnit(prop: keyof DeviceProperties): void;
	getName(): string | undefined;
	getWidthMedia(): string;
}
export interface DeviceManagerConfig {
	/**
	 * The device `id` to select on start, if not indicated, the first available from `devices` will be used.
	 * @default ''
	 */
	default?: string;
	/**
	 * Default devices.
	 * @example
	 * devices: [{
	 *  id: 'desktop',
	 *  name: 'Desktop',
	 *  width: '',
	 * }, {
	 *  id: 'tablet',
	 *  name: 'Tablet',
	 *  width: '770px',
	 *  widthMedia: '992px',
	 * },
	 * ...
	 * ]
	 */
	devices?: DeviceProperties[];
}
export interface I18nConfig {
	/**
	 * Locale value.
	 * @default 'en'
	 */
	locale?: string;
	/**
	 * Fallback locale.
	 * @default 'en'
	 */
	localeFallback?: string;
	/**
	 * Detect locale by checking browser language.
	 * @default true
	 */
	detectLocale?: boolean;
	/**
	 * Show warnings when some of the i18n resources are missing.
	 * @default false
	 */
	debug?: boolean;
	/**
	 * Messages to translate.
	 * @default { en: {...} }
	 */
	messages?: Record<string, any>;
	/**
	 * Additional messages. This allows extending the default `messages` set directly from the configuration.
	 */
	messagesAdd?: Record<string, any>;
}
export interface ModalConfig {
	stylePrefix?: string;
	title?: string;
	content?: string;
	/**
	 * Close modal on interact with backdrop.
	 * @default true
	 */
	backdrop?: boolean;
	/**
	 * Avoid rendering the default modal.
	 * @default false
	 */
	custom?: boolean;
	/**
	 * Extend ModalView object (view/ModalView.js)
	 * @example
	 * extend: {
	 *   template() {
	 *     return '<div>...New modal template...</div>';
	 *   },
	 * },
	 */
	extend?: Record<string, any>;
}
export interface LayerManagerConfig {
	stylePrefix?: string;
	/**
	 * Specify the element to use as a container, string (query) or HTMLElement.
	 * With the empty value, nothing will be rendered.
	 * @default ''
	 */
	appendTo?: string | HTMLElement;
	/**
	 * Enable/Disable globally the possibility to sort layers.
	 * @default true
	 */
	sortable?: boolean;
	/**
	 * Enable/Disable globally the possibility to hide layers.
	 * @default true
	 */
	hidable?: boolean;
	/**
	 * Hide textnodes.
	 * @default true
	 */
	hideTextnode?: boolean;
	/**
	 * Indicate a query string of the element to be selected as the root of layers.
	 * By default the root is the wrapper.
	 * @default ''
	 */
	root?: string;
	/**
	 * Indicates if the wrapper is visible in layers.
	 * @default true
	 */
	showWrapper?: boolean;
	/**
	 * Show hovered components in canvas.
	 * @default true
	 */
	showHover?: boolean;
	/**
	 * Scroll to selected component in Canvas when it's selected in Layers.
	 * true, false or `scrollIntoView`-like options,
	 * `block: 'nearest'` avoids the issue of window scrolling.
	 * @default { behavior: 'smooth', block: 'nearest' }
	 */
	scrollCanvas?: boolean | ScrollIntoViewOptions;
	/**
	 * Scroll to selected component in Layers when it's selected in Canvas.
	 * @default { behavior: 'auto', block: 'nearest' }
	 */
	scrollLayers?: boolean | ScrollIntoViewOptions;
	/**
	 * Highlight when a layer component is hovered.
	 * @default true
	 */
	highlightHover?: boolean;
	/**
	 * Avoid rendering the default layer manager.
	 * @default false
	 */
	custom?: boolean;
	/**
	 * WARNING: Experimental option.
	 * A callback triggered once the component layer is initialized.
	 * Useful to trigger updates on some component prop change.
	 * @example
	 * onInit({ component, render, listenTo }) {
	 *  listenTo(component, 'change:some-prop', render);
	 * };
	 */
	onInit?: () => void;
	/**
	 * WARNING: Experimental option.
	 * A callback triggered once the component layer is rendered.
	 * A callback useful to update the layer DOM on some component change
	 * @example
	 * onRender({ component, el }) { // el is the DOM of the layer
	 *  if (component.get('some-prop')) {
	 *    // do changes using the `el` DOM
	 *  }
	 * }
	 */
	onRender?: () => void;
	/**
	 * Extend Layer view object (view/ItemView.js)
	 * @example
	 * extend: {
	 *   setName(name) {
	 *     // this.model is the component of the layer
	 *     this.model.set('another-prop-for-name', name);
	 *   },
	 * },
	 */
	extend?: Record<string, any>;
}
export declare class Panels extends ModuleCollection<Panel> {
	constructor(module: PanelManager, models: Panel[] | Array<Record<string, any>>);
}
declare class PanelsView extends ModuleView<Panels> {
	constructor(target: Panels);
	private onRemove;
	/**
	 * Add to collection
	 * @param Object Model
	 *
	 * @return Object
	 * @private
	 * */
	private addTo;
	/**
	 * Add new object to collection
	 * @param  Object  Model
	 * @param  Object   Fragment collection
	 * @param  integer  Index of append
	 *
	 * @return Object Object created
	 * @private
	 * */
	private addToCollection;
	render(): this;
}
declare class PanelManager extends Module<PanelsConfig> {
	panels: Panels;
	PanelsViewObj?: PanelsView;
	/**
	 * Initialize module. Automatically called with a new instance of the editor
	 * @param {Object} config Configurations
	 * @private
	 */
	constructor(em: EditorModel);
	/**
	 * Returns the collection of panels
	 * @return {Collection} Collection of panel
	 */
	getPanels(): Panels;
	/**
	 * Returns panels element
	 * @return {HTMLElement}
	 */
	getPanelsEl(): HTMLElement | undefined;
	/**
	 * Add new panel to the collection
	 * @param {Object|Panel} panel Object with right properties or an instance of Panel
	 * @return {Panel} Added panel. Useful in case passed argument was an Object
	 * @example
	 * const newPanel = panelManager.addPanel({
	 *  id: 'myNewPanel',
	 *  visible: true,
	 *  buttons: [...],
	 * });
	 */
	addPanel(panel: Panel | PanelProperties): Panel;
	/**
	 * Remove a panel from the collection
	 * @param {Panel|String} panel Panel instance or panel id
	 * @return {Panel} Removed panel
	 * @example
	 * const somePanel = panelManager.getPanel('somePanel');
	 * const removedPanel = panelManager.removePanel(somePanel);
	 *
	 * // or by id
	 * const removedPanel = panelManager.removePanel('myNewPanel');
	 *
	 */
	removePanel(panel: Panel | string): Panel;
	/**
	 * Get panel by ID
	 * @param  {string} id Id string
	 * @return {Panel|null}
	 * @example
	 * const myPanel = panelManager.getPanel('myPanel');
	 */
	getPanel(id: string): Panel | null;
	/**
	 * Add button to the panel
	 * @param {string} panelId Panel's ID
	 * @param {Object|Button} button Button object or instance of Button
	 * @return {Button|null} Added button. Useful in case passed button was an Object
	 * @example
	 * const newButton = panelManager.addButton('myNewPanel',{
	 *   id: 'myNewButton',
	 *   className: 'someClass',
	 *   command: 'someCommand',
	 *   attributes: { title: 'Some title'},
	 *   active: false,
	 * });
	 * // It's also possible to pass the command as an object
	 * // with .run and .stop methods
	 * ...
	 * command: {
	 *   run: function(editor) {
	 *     ...
	 *   },
	 *   stop: function(editor) {
	 *     ...
	 *   }
	 * },
	 * // Or simply like a function which will be evaluated as a single .run command
	 * ...
	 * command: function(editor) {
	 *   ...
	 * }
	 */
	addButton(panelId: string, button: any): Button | null;
	/**
	 * Remove button from the panel
	 * @param {String} panelId Panel's ID
	 * @param {String} buttonId Button's ID
	 * @return {Button|null} Removed button.
	 * @example
	 * const removedButton = panelManager.addButton('myNewPanel',{
	 *   id: 'myNewButton',
	 *   className: 'someClass',
	 *   command: 'someCommand',
	 *   attributes: { title: 'Some title'},
	 *   active: false,
	 * });
	 *
	 * const removedButton = panelManager.removeButton('myNewPanel', 'myNewButton');
	 *
	 */
	removeButton(panelId: string, button: any): Button | null;
	/**
	 * Get button from the panel
	 * @param {string} panelId Panel's ID
	 * @param {string} id Button's ID
	 * @return {Button|null}
	 * @example
	 * const button = panelManager.getButton('myPanel', 'myButton');
	 */
	getButton(panelId: string, id: string): Button | null;
	/**
	 * Render panels and buttons
	 * @return {HTMLElement}
	 * @private
	 */
	render(): HTMLElement;
	/**
	 * Active activable buttons
	 * @private
	 */
	active(): void;
	/**
	 * Disable buttons flagged as disabled
	 * @private
	 */
	disableButtons(): void;
	destroy(): void;
}
export declare class Button extends ModuleModel<PanelManager> {
	defaults(): {
		id: string;
		label: string;
		tagName: string;
		className: string;
		command: string;
		context: string;
		buttons: never[];
		attributes: {};
		options: {};
		active: boolean;
		dragDrop: boolean;
		togglable: boolean;
		runDefaultCommand: boolean;
		stopDefaultCommand: boolean;
		disable: boolean;
	};
	get className(): string;
	get command(): string;
	get active(): boolean;
	set active(isActive: boolean);
	get togglable(): boolean;
	get runDefaultCommand(): boolean;
	get stopDefaultCommand(): boolean;
	get disable(): boolean;
	constructor(module: PanelManager, options: any);
}
export declare class Buttons extends ModuleCollection<Button> {
	constructor(module: PanelManager, models: Button[]);
	/**
	 * Deactivate all buttons, except one passed
	 * @param  {Object}  except  Model to ignore
	 * @param  {Boolean}  r     Recursive flag
	 *
	 * @return  void
	 * */
	deactivateAllExceptOne(except: Button, r: boolean): void;
	/**
	 * Deactivate all buttons
	 * @param  {String}  ctx Context string
	 *
	 * @return  void
	 * */
	deactivateAll(ctx?: string, sender?: any): void;
	/**
	 * Disables all buttons
	 * @param  {String}  ctx Context string
	 *
	 * @return  void
	 * */
	disableAllButtons(ctx?: string): void;
	/**
	 * Disables all buttons, except one passed
	 * @param  {Object}  except  Model to ignore
	 * @param  {Boolean}  r     Recursive flag
	 *
	 * @return  void
	 * */
	disableAllButtonsExceptOne(except: Button, r: boolean): void;
}
/** @private */
export interface PanelProperties {
	/**
	 * Panel id.
	 */
	id: string;
	/**
	 * Panel content.
	 */
	content?: string;
	/**
	 * Panel visibility.
	 * @default true
	 */
	visible?: boolean;
	/**
	 * Panel buttons.
	 * @default []
	 */
	buttons?: ObjectAny[];
	/**
	 * Panel attributes.
	 * @default {}
	 */
	attributes?: ObjectAny;
	/**
	 * Specify element query where to append the panel
	 */
	appendTo?: string;
	/**
	 * Resizable options.
	 */
	resizable?: boolean | ResizerOptions;
	el?: string;
	appendContent?: HTMLElement;
}
export interface PanelPropertiesDefined extends Omit<Required<PanelProperties>, "buttons"> {
	buttons: Buttons;
	[key: string]: unknown;
}
export declare class Panel extends ModuleModel<PanelManager, PanelPropertiesDefined> {
	defaults(): {
		id: string;
		content: string;
		visible: boolean;
		buttons: Buttons;
		attributes: {};
	};
	get buttons(): Buttons;
	private set buttons(value);
	view?: any;
	constructor(module: PanelManager, options: PanelProperties);
}
export interface ButtonProps {
	id?: string;
	active?: boolean;
	togglable?: boolean;
	className?: string;
	command?: string | (() => any);
	context?: string;
	attributes?: Record<string, any>;
}
export interface PanelProps extends Omit<PanelProperties, "id" | "buttons"> {
	id?: string;
	buttons?: ButtonProps[];
}
export interface PanelsConfig {
	stylePrefix?: string;
	/**
	 * Default panels.
	 */
	defaults?: PanelProps[];
}
export interface ParsedCssRule {
	selectors: string | string[];
	style: Record<string, string>;
	atRule?: string;
	params?: string;
}
export type CustomParserCss = (input: string, editor: Editor) => ParsedCssRule[];
export type CustomParserHtml = (input: string, options: HTMLParserOptions) => HTMLElement;
export interface HTMLParserOptions {
	/**
	 * DOMParser mime type.
	 * If you use the `text/html` parser, it will fix the invalid syntax automatically.
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
	 * @default 'text/html'
	 */
	htmlType?: DOMParserSupportedType;
	/**
	 * Allow <script> tags.
	 * @default false
	 */
	allowScripts?: boolean;
	/**
	 * Allow unsafe HTML attributes (eg. `on*` inline event handlers).
	 * @default false
	 */
	allowUnsafeAttr?: boolean;
	/**
	 * When false, removes empty text nodes when parsed, unless they contain a space.
	 * @default false
	 */
	keepEmptyTextNodes?: boolean;
}
export interface ParserConfig {
	/**
	 * Let the editor know which HTML tags should be treated as part of the text component.
	 * @default ['br', 'b', 'i', 'u', 'a', 'ul', 'ol']
	 */
	textTags?: string[];
	/**
	 * Let the editor know which Component types should be treated as part of the text component.
	 * @default ['text', 'textnode', 'comment']
	 */
	textTypes?: string[];
	/**
	 * Custom CSS parser.
	 * @see https://grapesjs.com/docs/guides/Custom-CSS-parser.html
	 */
	parserCss?: CustomParserCss;
	/**
	 * Custom HTML parser.
	 * At the moment, the custom HTML parser should rely on DOM Node instance as the result.
	 * @example
	 * // The return should be an instance of an Node as the root to traverse
	 * // https://developer.mozilla.org/en-US/docs/Web/API/Node
	 * // Here the result will be XMLDocument, which extends Node.
	 * parserHtml: (input, opts = {}) => (new DOMParser()).parseFromString(input, 'text/xml')
	 */
	parserHtml?: CustomParserHtml;
	/**
	 * Default HTML parser options (used in `parserModule.parseHtml('<div...', options)`).
	 */
	optionsHtml?: HTMLParserOptions;
}
export type RichTextEditorEvent = "rte:enable" | "rte:disable" | "rte:custom";
export interface ModelRTE {
	currentView?: ComponentView;
}
declare class RichTextEditorModule extends Module<RichTextEditorConfig & {
	pStylePrefix?: string;
}> {
	pfx: string;
	toolbar: HTMLElement;
	globalRte?: RichTextEditor;
	actionbar?: HTMLElement;
	lastEl?: HTMLElement;
	actions?: (RichTextEditorAction | string)[];
	customRte?: CustomRTE;
	model: Model<ModelRTE>;
	__dbdTrgCustom: Debounced;
	events: {
		enable: string;
		disable: string;
		custom: string;
	};
	/**
	 * Get configuration object
	 * @name getConfig
	 * @function
	 * @return {Object}
	 */
	constructor(em: EditorModel);
	onLoad(): void;
	__trgCustom(): void;
	destroy(): void;
	/**
	 * Post render callback
	 * @param  {View} ev
	 * @private
	 */
	postRender(ev: any): void;
	/**
	 * Init the built-in RTE
	 * @param  {HTMLElement} el
	 * @return {RichTextEditor}
	 * @private
	 */
	initRte(el: HTMLElement): RichTextEditor;
	/**
	 * Add a new action to the built-in RTE toolbar
	 * @param {string} name Action name
	 * @param {Object} action Action options
	 * @example
	 * rte.add('bold', {
	 *   icon: '<b>B</b>',
	 *   attributes: {title: 'Bold'},
	 *   result: rte => rte.exec('bold')
	 * });
	 * rte.add('link', {
	 *   icon: document.getElementById('t'),
	 *   attributes: { title: 'Link' },
	 *   // Example on how to wrap selected content
	 *   result: rte => rte.insertHTML(`<a href="#">${rte.selection()}</a>`)
	 * });
	 * // An example with fontSize
	 * rte.add('fontSize', {
	 *   icon: `<select class="gjs-field">
	 *         <option>1</option>
	 *         <option>4</option>
	 *         <option>7</option>
	 *       </select>`,
	 *     // Bind the 'result' on 'change' listener
	 *   event: 'change',
	 *   result: (rte, action) => rte.exec('fontSize', action.btn.firstChild.value),
	 *   // Callback on any input change (mousedown, keydown, etc..)
	 *   update: (rte, action) => {
	 *     const value = rte.doc.queryCommandValue(action.name);
	 *     if (value != 'false') { // value is a string
	 *       action.btn.firstChild.value = value;
	 *     }
	 *    }
	 *   })
	 * // An example with state
	 * const isValidAnchor = (rte) => {
	 *   // a utility function to help determine if the selected is a valid anchor node
	 *   const anchor = rte.selection().anchorNode;
	 *   const parentNode  = anchor && anchor.parentNode;
	 *   const nextSibling = anchor && anchor.nextSibling;
	 *   return (parentNode && parentNode.nodeName == 'A') || (nextSibling && nextSibling.nodeName == 'A')
	 * }
	 * rte.add('toggleAnchor', {
	 *   icon: `<span style="transform:rotate(45deg)">&supdsub;</span>`,
	 *   state: (rte, doc) => {
	 *    if (rte && rte.selection()) {
	 *      // `btnState` is a integer, -1 for disabled, 0 for inactive, 1 for active
	 *      return isValidAnchor(rte) ? btnState.ACTIVE : btnState.INACTIVE;
	 *    } else {
	 *      return btnState.INACTIVE;
	 *    }
	 *   },
	 *   result: (rte, action) => {
	 *     if (isValidAnchor(rte)) {
	 *       rte.exec('unlink');
	 *     } else {
	 *       rte.insertHTML(`<a class="link" href="">${rte.selection()}</a>`);
	 *     }
	 *   }
	 * })
	 */
	add(name: string, action?: Partial<RichTextEditorAction>): void;
	/**
	 * Get the action by its name
	 * @param {string} name Action name
	 * @return {Object}
	 * @example
	 * const action = rte.get('bold');
	 * // {name: 'bold', ...}
	 */
	get(name: string): RichTextEditorAction | undefined;
	/**
	 * Get all actions
	 * @return {Array}
	 */
	getAll(): RichTextEditorAction[];
	/**
	 * Remove the action from the toolbar
	 * @param  {string} name
	 * @return {Object} Removed action
	 * @example
	 * const action = rte.remove('bold');
	 * // {name: 'bold', ...}
	 */
	remove(name: string): RichTextEditorAction | undefined;
	/**
	 * Run action command.
	 * @param action Action to run
	 * @example
	 * const action = rte.get('bold');
	 * rte.run(action) // or rte.run('bold')
	 */
	run(action: string | RichTextEditorAction): void;
	/**
	 * Get the toolbar element
	 * @return {HTMLElement}
	 */
	getToolbarEl(): HTMLElement;
	/**
	 * Triggered when the offset of the editor is changed
	 * @private
	 */
	updatePosition(): void;
	/**
	 * Enable rich text editor on the element
	 * @param {View} view Component view
	 * @param {Object} rte The instance of already defined RTE
	 * @private
	 * */
	enable(view: ComponentView, rte: RichTextEditor, opts?: any): Promise<any>;
	getContent(view: ComponentView, rte: RichTextEditor): Promise<string>;
	hideToolbar(): void;
	/**
	 * Unbind rich text editor from the element
	 * @param {View} view
	 * @param {Object} rte The instance of already defined RTE
	 * @private
	 * */
	disable(view: ComponentView, rte?: RichTextEditor, opts?: DisableOptions): void;
}
export interface RichTextEditorAction {
	name: string;
	icon: string | HTMLElement;
	event?: string;
	attributes?: Record<string, any>;
	result: (rte: RichTextEditor, action: RichTextEditorAction) => void;
	update?: (rte: RichTextEditor, action: RichTextEditorAction) => number;
	state?: (rte: RichTextEditor, doc: Document) => number;
	btn?: HTMLElement;
	currentState?: RichTextEditorActionState;
}
declare enum RichTextEditorActionState {
	ACTIVE = 1,
	INACTIVE = 0,
	DISABLED = -1
}
export interface RichTextEditorOptions {
	actions?: (RichTextEditorAction | string)[];
	classes?: Record<string, string>;
	actionbar?: HTMLElement;
	actionbarContainer?: HTMLElement;
	styleWithCSS?: boolean;
	module?: RichTextEditorModule;
}
export type EffectOptions = {
	event?: Event;
};
declare class RichTextEditor {
	em: EditorModel;
	settings: RichTextEditorOptions;
	classes: Record<string, string>;
	actionbar?: HTMLElement;
	actions: RichTextEditorAction[];
	el: HTMLElement;
	doc: Document;
	enabled?: boolean;
	getContent?: () => string;
	constructor(em: EditorModel, el: HTMLElement & {
		_rte?: RichTextEditor;
	}, settings?: RichTextEditorOptions);
	isCustom(module?: RichTextEditorModule): boolean;
	destroy(): void;
	setEl(el: HTMLElement): void;
	updateActiveActions(): void;
	enable(opts: EffectOptions): this;
	disable(): this;
	__toggleEffects(enable?: boolean, opts?: EffectOptions): this;
	__onKeydown(ev: KeyboardEvent): void;
	__onPaste(ev: ClipboardEvent): void;
	/**
	 * Sync actions with the current RTE
	 */
	syncActions(): void;
	/**
	 * Add new action to the actionbar
	 * @param {Object} action
	 * @param {Object} [opts={}]
	 */
	addAction(action: RichTextEditorAction, opts?: {
		sync?: boolean;
	}): void;
	/**
	 * Get the array of current actions
	 * @return {Array}
	 */
	getActions(): RichTextEditorAction[];
	/**
	 * Returns the Selection instance
	 * @return {Selection}
	 */
	selection(): Selection | null;
	/**
	 * Wrapper around [execCommand](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand) to allow
	 * you to perform operations like `insertText`
	 * @param  {string} command Command name
	 * @param  {any} [value=null Command's arguments
	 */
	exec(command: string, value?: string): void;
	/**
	 * Get the actionbar element
	 * @return {HTMLElement}
	 */
	actionbarEl(): HTMLElement | undefined;
	/**
	 * Set custom HTML to the selection, useful as the default 'insertHTML' command
	 * doesn't work in the same way on all browsers
	 * @param  {string} value HTML string
	 */
	insertHTML(value: string | HTMLElement, { select }?: {
		select?: boolean;
	}): void;
}
export interface CustomRTE<T = any> {
	/**
	 * If true, the returned HTML content will be parsed into Components, allowing
	 * the custom RTE to behave in the same way as the native one.
	 * If false, the HTML content will be used as it is in the canvas and the export code.
	 */
	parseContent?: boolean;
	/**
	 * Create or enable the custom RTE.
	 */
	enable: (el: HTMLElement, rte: T | undefined) => T | Promise<T>;
	/**
	 * Disable the custom RTE.
	 */
	disable: (el: HTMLElement, rte: T) => any | Promise<any>;
	/**
	 * Get HTML content from the custom RTE.
	 * If not specified, it will use the innerHTML of the element (passed also as `content` in options).
	 */
	getContent?: (el: HTMLElement, rte: T | undefined) => string | Promise<string>;
	/**
	 * Destroy the custom RTE.
	 * Will be triggered on editor destroy.
	 */
	destroy?: () => void;
	[key: string]: unknown;
}
export interface RichTextEditorConfig {
	/**
	 * Class name prefix for styles
	 * @default 'rte-'
	 */
	stylePrefix?: string;
	/**
	 * If true, moves the toolbar below the element when the top canvas edge is reached.
	 * @default true
	 */
	adjustToolbar?: boolean;
	/**
	 * Default RTE actions.
	 * @default ['bold', 'italic', 'underline', 'strikethrough', 'link', 'wrap']
	 */
	actions?: string[];
	/**
	 * Custom on paste logic for the built-in RTE.
	 * @example
	 * onPaste: ({ ev, rte }) => {
	 *  ev.preventDefault();
	 *  const { clipboardData } = ev;
	 *  const text = clipboardData.getData('text');
	 *  rte.exec('insertHTML', `<b>[ ${text} ]</b>`);
	 * }
	 */
	onPaste?: (data: {
		ev: ClipboardEvent;
		editor: Editor;
		rte: RichTextEditor;
	}) => void;
	/**
	 * Custom on keydown logic for the built-in RTE.
	 * @example
	 * onKeydown: ({ ev, rte }) => {
	 *  if (ev.key === 'Enter') {
	 *    ev.preventDefault();
	 *    rte.exec('insertHTML', `<br>-- custom line break --<br>`);
	 *  }
	 * }
	 */
	onKeydown?: (data: {
		ev: KeyboardEvent;
		editor: Editor;
		rte: RichTextEditor;
	}) => void;
	/**
	 * Avoid rendering the default RTE UI.
	 * @default false
	 */
	custom?: boolean;
}
export interface SelectorManagerConfig {
	/**
	 * Style prefix.
	 * @default 'clm-'
	 */
	stylePrefix?: string;
	/**
	 * Specify the element to use as a container, string (query) or HTMLElement.
	 * With the empty value, nothing will be rendered.
	 * @default ''
	 */
	appendTo?: string | HTMLElement;
	/**
	 * Default selectors.
	 * @default []
	 */
	selectors?: any[];
	/**
	 * Default states.
	 * @default [{ name: 'hover' }, { name: 'active' }, { name: 'nth-of-type(2n)' }]
	 */
	states?: any[];
	/**
	 * Custom selector name escaping strategy.
	 * @example
	 * escapeName: name => name.replace(' ', '_'),
	 */
	escapeName?: (name: string) => string;
	/**
	 * Custom selected name strategy (the string you see after 'Selected').
	 * @example
	 * selectedName: ({ result, state, target }) => `${result} - ID: ${target.getId()}`,
	 */
	selectedName?: (props: {
		result: string;
		state: any;
		target: any;
	}) => string;
	/**
	 * Icon used to add new selector
	 */
	iconAdd?: string;
	/**
	 * Icon used to sync styles.
	 */
	iconSync?: string;
	/**
	 * Icon to show when the selector is enabled.
	 */
	iconTagOn?: string;
	/**
	 * Icon to show when the selector is disabled.
	 */
	iconTagOff?: string;
	/**
	 * Icon used to remove the selector.
	 */
	iconTagRemove?: string;
	/**
	 * Custom render function for the Selector Manager.
	 * @example
	 * render: ({ el, labelHead, labelStates, labelInfo, }) => {
	 *  // You can use the default `el` to extend/edit the current
	 *  // DOM element of the Selector Manager
	 *  const someEl = document.createElement('div');
	 *  // ...
	 *  el.appendChild(someEl);
	 *  // no need to return anything from the function
	 *
	 *  // Create and return a new DOM element
	 *  const newEl = document.createElement('div');
	 *  // ...
	 *  return newEl;
	 *
	 *  // Return an HTML string for a completely different layout.
	 *  // Use `data-*` attributes to make the module recognize some elements:
	 *  // `data-states` - Where to append state `<option>` elements (or just write yours)
	 *  // `data-selectors` - Where to append selectors
	 *  // `data-input` - Input element which is used to add new selectors
	 *  // `data-add` - Element which triggers the add of a new selector on click
	 *  // `data-sync-style` - Element which triggers the sync of styles (visible with `componentFirst` enabled)
	 *  // `data-selected` - Where to print selected selectors
	 *  return `
	 *    <div class="my-sm-header">
	 *     <div>${labelHead}</div>
	 *     <div>
	 *       <select data-states>
	 *         <option value="">${labelStates}</option>
	 *       </select>
	 *     </div>
	 *    </div>
	 *    <div class="my-sm-body">
	 *      <div data-selectors></div>
	 *      <input data-input/>
	 *      <span data-add>Add</span>
	 *      <span data-sync-style>Sync</span>
	 *    </div>
	 *    <div class="my-sm-info">
	 *      <div>${labelInfo}</div>
	 *      <div data-selected></div>
	 *    </div>
	 * `;
	 * }
	 */
	render?: (props: any) => string;
	/**
	 * When you select a component in the canvas the selected Model (Component or CSS Rule)
	 * is passed to the StyleManager which will be then able to be styled, these are the cases:
	 * - Selected component doesn't have any classes: Component will be passed
	 * - Selected component has at least one class: The CSS Rule will be passed
	 *
	 * With this option enabled, also in the second case, the Component will be passed.
	 * This method allows to avoid styling classes directly and make, for example, some
	 * unintended changes below the visible canvas area (when components share same classes).
	 * @default false
	 */
	componentFirst?: boolean;
	/**
	 * Avoid rendering the default Selector Manager UI.
	 * @default false
	 */
	custom?: boolean;
}
export interface StorageOptions {
	[key: string]: any;
}
export interface ProjectData {
	[key: string]: any;
}
export interface IStorage<T extends StorageOptions = {}> {
	load: (options: T) => Promise<ProjectData>;
	store: (data: ProjectData, options: T) => Promise<any>;
	[key: string]: any;
}
export interface LocalStorageConfig {
	/**
	 * Local key identifier of the project.
	 * @default 'gjsProject'
	 */
	key?: string;
	/**
	 * If enabled, checks if browser supports LocalStorage.
	 * @default true
	 */
	checkLocal?: boolean;
}
export interface RemoteStorageConfig {
	/**
	 * Custom headers.
	 * @default {}
	 */
	headers?: ObjectAny;
	/**
	 * Endpoint URL where to store data project.
	 */
	urlStore?: string;
	/**
	 * Endpoint URL where to load data project.
	 */
	urlLoad?: string;
	/**
	 * Use JSON contentType.
	 * @default true
	 */
	contentTypeJson?: boolean;
	/**
	 * Credentials option for the fetch API.
	 * @default 'include'
	 */
	credentials?: RequestCredentials;
	/**
	 * Pass custom options to fetch API (remote storage)
	 * You can pass a simple object: { someOption: 'someValue' }
	 * or a function which returns and object to add:
	 * @example
	 * fetchOptions: currentOpts => {
	 *  return currentOpts.method === 'POST' ?  { method: 'PATCH' } : {};
	 * },
	 */
	fetchOptions?: string | ((opts: RequestInit) => RequestInit);
	/**
	 * The remote storage sends the project data as a body of the request.
	 * You can use this method to update the body before the store call in order to align
	 * with your API requirements.
	 * @default data => data
	 */
	onStore?: (data: ProjectData, editor: Editor) => ProjectData;
	/**
	 * The remote storage loads the project data directly from the request response.
	 * You can use this method to properly extract the project data from the response.
	 * @default data => data
	 */
	onLoad?: (data: ProjectData, editor: Editor) => ProjectData;
}
export interface StorageManagerConfig {
	/**
	 * Prefix identifier that will be used inside storing and loading.
	 * @default 'gjs-'
	 * @deprecated
	 */
	id?: string;
	/**
	 * Default storage type.
	 * Available by default: 'local' | 'remote'
	 * @default 'local'
	 */
	type?: LiteralUnion<"local" | "remote", string>;
	/**
	 * Enable/disable autosaving.
	 * @default true
	 */
	autosave?: boolean;
	/**
	 * Enable/disable autoload of data on editor init.
	 * @default true
	 */
	autoload?: boolean;
	/**
	 * If autosave enabled, indicates how many steps (general changes to structure)
	 * need to be done before save. Useful with remoteStorage to reduce remote calls
	 * @default 1
	 */
	stepsBeforeSave?: number;
	/**
	 * In case the `remote` storage is selected, and this options is enabled, the project
	 * will be stored on the `local` storage in case the remote one fails.
	 * The local data are cleared on every sucessful remote save. When the remote storage
	 * fails (eg. network issue) and the editor is reloaded, a dialog with the possibility to
	 * recovery previous data will be shown.
	 * @default false
	 * @example
	 * // Enable recovery with default confirm dialog
	 * recovery: true,
	 * // Enable recovery with a custom dialog
	 * recovery: (accept, cancel, editor) => {
	 *   confirm('Recover data?') ? accept() : cancel();
	 * },
	 */
	recovery?: boolean | ((accept: Function, cancel: Function, editor: Editor) => void);
	/**
	 * Callback triggered before the store call (can be asynchronous).
	 * This can be used to enrich the project data to store.
	 * @default data => data
	 */
	onStore?: (data: ProjectData, editor: Editor) => ProjectData;
	/**
	 * Callback triggered after the load call (can be asynchronous).
	 * @default data => data
	 */
	onLoad?: (data: ProjectData, editor: Editor) => ProjectData;
	/**
	 * Default storage options.
	 */
	options?: {
		local?: LocalStorageConfig;
		remote?: RemoteStorageConfig;
		[key: string]: any;
	};
}
export interface UndoManagerConfig {
	/**
	 * Maximum number of undo items.
	 * @default 500
	 */
	maximumStackLength?: number;
	/**
	 * Track component selection.
	 * @default true
	 */
	trackSelection?: boolean;
}
export type PluginOptions = Record<string, any>;
export type Plugin<T extends PluginOptions = {}> = (editor: Editor, config: T) => void;
declare class PluginManager {
	plugins: Record<string, Plugin>;
	/**
	 * Add new plugin. Plugins could not be overwritten
	 * @param {string} id Plugin ID
	 * @param {Function} plugin Function which contains all plugin logic
	 * @return {Function} The plugin function
	 * @deprecated Don't use named plugins, create plugins as simple functions. More about [Plugins](https://grapesjs.com/docs/modules/Plugins.html)
	 * @example
	 * PluginManager.add('some-plugin', function(editor) {
	 *   editor.Commands.add('new-command', {
	 *     run:  function(editor, senderBtn){
	 *       console.log('Executed new-command');
	 *     }
	 *   })
	 * });
	 */
	add<T extends PluginOptions>(id: string, plugin: Plugin<T>): Plugin<T>;
	/**
	 * Returns plugin by ID
	 * @param  {string} id Plugin ID
	 * @return {Function|undefined} Plugin
	 * @example
	 * var plugin = PluginManager.get('some-plugin');
	 * plugin(editor);
	 */
	get<T extends PluginOptions>(id: string): Plugin<T> | undefined;
	/**
	 * Returns object with all plugins
	 */
	getAll(): Record<string, Plugin<{}>>;
}
export interface CommandsConfig {
	/**
	 * Style prefix
	 * @default 'com-'
	 */
	stylePrefix?: string;
	/**
	 * Default commands
	 * @default {}
	 */
	defaults?: Record<string, CommandObject>;
	/**
	 * If true, stateful commands (with `run` and `stop` methods) can't be executed multiple times.
	 * If the command is already active, running it again will not execute the `run` method.
	 * @default true
	 */
	strict?: boolean;
}
declare class Input extends View {
	ppfx: string;
	em: EditorModel;
	opts: any;
	inputEl?: any;
	template(): string;
	inputClass(): string;
	holderClass(): string;
	constructor(opts?: any);
	/**
	 * Fired when the element of the property is updated
	 */
	elementUpdated(): void;
	/**
	 * Set value to the input element
	 * @param {string} value
	 */
	setValue(value: string, opts?: any): void;
	/**
	 * Updates the view when the model is changed
	 * */
	handleModelChange(model: any, value: string, opts: any): void;
	/**
	 * Handled when the view is changed
	 */
	handleChange(e: Event): void;
	__onInputChange(value: string): void;
	/**
	 * Get the input element
	 * @return {HTMLElement}
	 */
	getInputEl(): any;
	render(): this;
}
declare class InputNumber extends Input {
	doc: Document;
	unitEl?: any;
	moved?: boolean;
	prValue?: number;
	current?: {
		y: number;
		val: string;
	};
	template(): string;
	inputClass(): any;
	constructor(opts?: {});
	/**
	 * Set value to the model
	 * @param {string} value
	 * @param {Object} opts
	 */
	setValue(value: string, opts?: any): void;
	/**
	 * Handled when the view is changed
	 */
	handleChange(e: Event): void;
	/**
	 * Handled when the view is changed
	 */
	handleUnitChange(e: Event): void;
	/**
	 * Handled when user uses keyboard
	 */
	handleKeyDown(e: KeyboardEvent): void;
	/**
	 * Fired when the element of the property is updated
	 */
	elementUpdated(): void;
	/**
	 * Updates the view when the model is changed
	 * */
	handleModelChange(): void;
	/**
	 * Get the unit element
	 * @return {HTMLElement}
	 */
	getUnitEl(): any;
	/**
	 * Invoked when the up arrow is clicked
	 * */
	upArrowClick(): void;
	/**
	 * Invoked when the down arrow is clicked
	 * */
	downArrowClick(): void;
	/**
	 * Change easily integer input value with click&drag method
	 * @param Event
	 *
	 * @return void
	 * */
	downIncrement(e: MouseEvent): void;
	/** While the increment is clicked, moving the mouse will update input value
	 * @param Object
	 *
	 * @return bool
	 * */
	moveIncrement(ev: MouseEvent): boolean;
	/**
	 * Stop moveIncrement method
	 * */
	upIncrement(): void;
	normalizeValue(value: any, defValue?: number): any;
	/**
	 * Validate input value
	 * @param {String} value Raw value
	 * @param {Object} opts Options
	 * @return {Object} Validated string
	 */
	validateInputValue(value?: any, opts?: any): {
		force: number;
		value: any;
		unit: any;
	};
	render(): this;
}
/** @private */
export interface PropertyNumberProps extends PropertyProps {
	/**
	 * Array of units, eg. `['px', '%']`
	 */
	units?: string[];
	/**
	 * Unit defualt value.
	 */
	unit?: string;
	/**
	 * Minimum value.
	 */
	min?: number;
	/**
	 * Maximum value.
	 */
	max?: number;
	/**
	 * Step value.
	 * @default 1
	 */
	step?: number;
}
/**
 * @typedef PropertyNumber
 * @property {Array<String>} units Array of units, eg. `['px', '%']`
 * @property {Number} min Minimum value.
 * @property {Number} max Maximum value.
 * @property {Number} step Step value.
 *
 */
export declare class PropertyNumber extends Property<PropertyNumberProps> {
	input?: InputNumber;
	defaults(): any;
	/**
	 * Get property units.
	 * @returns {Array<String>}
	 */
	getUnits(): string[];
	/**
	 * Get property unit value.
	 * @returns {String}
	 */
	getUnit(): string;
	/**
	 * Get min value.
	 * @returns {Number}
	 */
	getMin(): number;
	/**
	 * Get max value.
	 * @returns {Number}
	 */
	getMax(): number;
	/**
	 * Get step value.
	 * @returns {Number}
	 */
	getStep(): number;
	/**
	 * Update property unit value.
	 * The change is also propagated to the selected targets.
	 * @param {String} unit New unit value
	 * @param {Object} [opts={}] Options
	 * @param {Boolean} [opts.noTarget=false] If `true` the change won't be propagated to selected targets.
	 * @returns {String}
	 */
	upUnit(unit: string, opts?: {
		noTarget?: boolean;
	}): this;
	initialize(props?: {}, opts?: {}): void;
	__getClearProps(): {
		unit: string;
	};
	parseValue(val: any, opts?: {}): Partial<PropertyNumberProps>;
	getFullValue(): string;
}
export type SelectOption = {
	id: string;
	value?: string;
	label?: string;
	name?: string;
	className?: string;
	title?: string;
	style?: string;
	propValue?: ObjectAny;
};
/** @private */
export interface PropertySelectProps extends PropertyProps {
	options?: SelectOption[];
	list?: SelectOption[];
}
/**
 * @typedef PropertySelect
 * @property {Array<Object>} options Array of option definitions.
 * \n
 * ```js
 * options: [
 *  { id: '100', label: 'Set 100' },
 *  { id: '200', label: 'Set 200' },
 * ]
 * ```
 */
export declare class PropertySelect extends Property<PropertySelectProps> {
	defaults(): any;
	/**
	 * Get available options.
	 * @returns {Array<Object>} Array of options
	 */
	getOptions(): SelectOption[];
	/**
	 * Get current selected option or by id.
	 * @param {String} [id] Option id.
	 * @returns {Object | null}
	 */
	getOption(id?: string): SelectOption;
	/**
	 * Update options.
	 * @param {Array<Object>} value New array of options, eg. `[{ id: 'val-1', label: 'Value 1' }]`
	 */
	setOptions(value?: SelectOption[]): this;
	/**
	 * Add new option.
	 * @param {Object} value Option object, eg. `{ id: 'val-1', label: 'Value 1' }`
	 */
	addOption(value: SelectOption): this;
	/**
	 * Get the option id from the option object.
	 * @param {Object} option Option object
	 * @returns {String} Option id
	 */
	getOptionId(option: SelectOption): string;
	/**
	 * Get option label.
	 * @param {String|Object} id Option id or the option object
	 * @param {Object} [opts={}] Options
	 * @param {Boolean} [opts.locale=true] Use the locale string from i18n module
	 * @returns {String} Option label
	 */
	getOptionLabel(id: string | SelectOption, opts?: {
		locale?: boolean;
		property?: string;
	}): string;
	initialize(...args: any): void;
	__onOptionChange(): void;
}
export type PropValues = Record<string, any>;
export type OptionByName = {
	byName?: boolean;
};
export type FromStyle = (style: StyleProps, data: FromStyleData) => PropValues;
export type FromStyleData = {
	property: Property;
	name: string;
	separator: RegExp;
};
export type ToStyle = (values: PropValues, data: ToStyleData) => StyleProps;
export type ToStyleData = {
	join: string;
	name: string;
	property: Property;
};
/** @private */
export interface PropertyCompositeProps extends PropertyProps {
	detached?: boolean;
	/**
	 * Array of sub properties, eg. `[{ type: 'number', property: 'margin-top' }, ...]`
	 */
	properties: (PropertyProps | PropertyNumberProps | PropertySelectProps)[];
	/**
	 * Value used to split property values, default `" "`.
	 */
	separator?: string;
	/**
	 * Value used to join property values, default `" "`.
	 */
	join?: string;
	/**
	 * Custom logic for getting property values from the target style object.
	 */
	fromStyle?: FromStyle;
	/**
	 * Custom logic for creating the CSS style object to apply on selected targets.
	 */
	toStyle?: ToStyle;
}
/**
 *
 * [Property]: property.html
 *
 *
 * @typedef PropertyComposite
 * @property {Array<Object>} properties Array of sub properties, eg. `[{ type: 'number', property: 'margin-top' }, ...]`
 * @property {Boolean} [detached=false] Indicate if the final CSS property is splitted (detached: `margin-top: X; margin-right: Y; ...`) or combined (not detached: `margin: X Y ...;`)
 * @property {String|RegExp} [separator=' '] Value used to split property values, default `" "`.
 * @property {String} [join=' '] Value used to join property values, default `" "`.
 * @property {Function} [fromStyle] Custom logic for getting property values from the target style object.
 * \n
 * ```js
 *  fromStyle: (style) => {
 *    const margins = parseMarginShorthand(style.margin);
 *    return {
 *      'margin-top': margins.top,
 *      // ...
 *    };
 *  }
 * ```
 * @property {Function} [toStyle] Custom logic for creating the CSS style object to apply on selected targets.
 * \n
 * ```js
 *  toStyle: (values) => {
 *    const top = values['margin-top'] || 0;
 *    const right = values['margin-right'] || 0;
 *    // ...
 *    return {
 *      margin: `${top} ${right} ...`,
 *    };
 *  }
 * ```
 */
export declare class PropertyComposite<T extends Record<string, any> = PropertyCompositeProps> extends Property<T> {
	defaults(): any;
	initialize(props?: {}, opts?: {}): void;
	get properties(): Property[];
	/**
	 * Get properties.
	 * @returns {Array<[Property]>}
	 */
	getProperties(): Property[];
	/**
	 * Get property by id.
	 * @param  {String} id Property id.
	 * @returns {[Property]|null}
	 */
	getProperty(id: string): Property | undefined;
	/**
	 * Get property at index.
	 * @param  {Number} index
	 * @returns {[Property]|null}
	 */
	getPropertyAt(index: number): any;
	/**
	 * Check if the property is detached.
	 * @returns {Boolean}
	 */
	isDetached(): boolean;
	/**
	 * Get current values of properties.
	 * @param {Object} [opts={}] Options
	 * @param {Boolean} [opts.byName=false] Use property names as a key instead of the id.
	 * @returns {Object}
	 * @example
	 * // In case the property is `margin` with sub properties like `margin-top`, `margin-right`, etc.
	 * console.log(property.getValues());
	 * // { 'margin-top': '10px', 'margin-right': '20px', ... };
	 */
	getValues({ byName }?: {
		byName?: boolean;
	}): Record<string, any>;
	/**
	 * Get property separator.
	 * @returns {RegExp}
	 */
	getSeparator(): RegExp;
	/**
	 * Get the join value.
	 * @returns {String}
	 */
	getJoin(): (T["join"] & string) | NonNullable<T["separator"]>;
	/**
	 * Get style object from current properties
	 * @param {Object} [opts={}] Options
	 * @param {Boolean} [opts.camelCase] Return property names in camelCase.
	 * @returns {Object} Style object
	 * @private
	 */
	getStyleFromProps(opts?: OptionsStyle): StyleProps;
	getSplitSeparator(): RegExp;
	__upProperties(p: PropertyComposite, opts?: any): void;
	__upTargetsStyleProps(opts?: {}, prop?: Property): void;
	_up(props: Partial<T>, opts?: OptionsUpdate): this;
	getStyle(opts?: {
		camelCase?: boolean;
	}): StyleProps;
	__getFullValue(opts?: any): string;
	__getJoin(): (T["join"] & string) | NonNullable<T["separator"]>;
	__styleHasProps(style?: StyleProps): boolean;
	__splitValue(value: string | string[], sep: string | RegExp): string[];
	__splitStyleName(style: StyleProps, name: string, sep: string | RegExp): string[];
	__getSplitValue(value?: string | string[], { byName }?: OptionByName): StyleProps;
	__getPropsFromStyle(style?: StyleProps, opts?: OptionByName): any;
	__setProperties(values?: Record<string, any>, opts?: OptionsUpdate): void;
	clear(): this;
	hasValue(opts?: Parameters<Property["hasValue"]>[0]): boolean;
	getFullValue(): string;
	__canClearProp(prop: Property): boolean;
}
/** @private */
export interface PropertyProps {
	name?: string;
	label?: string;
	id?: string;
	property?: string;
	type?: string;
	defaults?: string;
	default?: string;
	info?: string;
	value?: any;
	icon?: string;
	functionName?: string;
	status?: string;
	visible?: boolean;
	fixedValues?: string[];
	className?: string;
	extend?: string;
	onChange?: (data: {
		property: Property;
		from: PartialPropertyProps;
		to: PartialPropertyProps;
		value: any;
		opts: any;
	}) => any;
	/**
	 * If true, the property will be forced to be full width
	 */
	full?: boolean;
	/**
	 * If true to the value will be added '!important'
	 */
	important?: boolean;
	/**
	 * If true, will be hidden by default and will show up only for targets
	 * which require this property (via `stylable-require`)
	 * Use case:
	 * you can add all SVG CSS properties with toRequire as true
	 * and then require them on SVG Components
	 */
	toRequire?: boolean;
	/**
	 * Specifies dependency on other properties of the selected object.
	 * Property is shown only when all conditions are matched.
	 *
	 * example: { display: ['flex', 'block'], position: ['absolute'] };
	 * in this case the property is only shown when display is
	 * of value 'flex' or 'block' AND position is 'absolute'
	 */
	requires?: Record<string, any>;
	/**
	 * Specifies dependency on properties of the parent of the selected object.
	 * Property is shown only when all conditions are matched.
	 */
	requiresParent?: any;
	parentTarget?: any;
	__p?: any;
}
export type OptionsUpdate = {
	partial?: boolean;
	noTarget?: boolean;
	__up?: boolean;
	__clear?: boolean;
};
export type OptionsStyle = {
	camelCase?: boolean;
};
export type PartialPropertyProps = Partial<PropertyProps>;
/**
 * @typedef Property
 * @property {String} id Property id, eg. `my-property-id`.
 * @property {String} property Related CSS property name, eg. `text-align`.
 * @property {String} default Defaul value of the property.
 * @property {String} label Label to use in UI, eg. `Text Align`.
 * @property {Function} [onChange] Change callback.
 * \n
 * ```js
 *  onChange: ({ property, from, to }) => {
 *    console.log(`Changed property`, property.getName(), { from, to });
 *  }
 * ```
 *
 */
export declare class Property<T extends Record<string, any> = PropertyProps> extends Model<T> {
	em: EditorModel;
	parent?: Property;
	static getDefaults(): any;
	/**
	 * @private
	 * @ts-ignore */
	defaults(): {
		name: string;
		property: string;
		type: string;
		defaults: string;
		info: string;
		value: string;
		icon: string;
		functionName: string;
		status: string;
		visible: boolean;
		fixedValues: string[];
		full: boolean;
		important: boolean;
		toRequire: boolean;
		requires: undefined;
		requiresParent: null;
		parentTarget: null;
	};
	initialize(props?: {}, opts?: any): void;
	__getParentProp<T = PropertyComposite>(): T;
	__upTargets(p: this, opts?: any): void;
	__upTargetsStyle(style: StyleProps, opts: any): void;
	_up(props: Partial<T>, opts?: OptionsUpdate): this;
	up(props: PartialPropertyProps, opts?: {}): void;
	init(): void;
	/**
	 * Get property id.
	 * @returns {String}
	 */
	getId(): string;
	/**
	 * Get the property type.
	 * The type of the property is defined on property creation and based on its value the proper Property class is assigned.
	 * The default type is `base`.
	 * @returns {String}
	 */
	getType(): string;
	/**
	 * Get name (the CSS property name).
	 * @returns {String}
	 */
	getName(): string;
	/**
	 * Get property label.
	 * @param {Object} [opts={}] Options
	 * @param {Boolean} [opts.locale=true] Use the locale string from i18n module
	 * @returns {String}
	 */
	getLabel(opts?: {
		locale?: boolean;
	}): any;
	/**
	 * Get property value.
	 * @param {Object} [opts={}] Options
	 * @param {Boolean} [opts.noDefault=false] Avoid returning the default value
	 * @returns {String}
	 */
	getValue(opts?: {
		noDefault?: boolean;
	}): string | T["value"] | undefined;
	/**
	 * Check if the property has value.
	 * @param {Object} [opts={}] Options
	 * @param {Boolean} [opts.noParent=false] Ignore the value if it comes from the parent target.
	 * @returns {Boolean}
	 */
	hasValue(opts?: {
		noParent?: boolean;
	}): boolean;
	/**
	 * Indicates if the current value is coming from a parent target (eg. another CSSRule).
	 * @returns {Boolean}
	 */
	hasValueParent(): boolean;
	/**
	 * Get the CSS style object of the property.
	 * @param {Object} [opts={}] Options
	 * @param {Boolean} [opts.camelCase] Return property name in camelCase.
	 * @return {Object}
	 * @example
	 * // In case the property is `color` with a value of `red`.
	 * console.log(property.getStyle());
	 * // { color: 'red' };
	 */
	getStyle(opts?: OptionsStyle): StyleProps;
	/**
	 * Get the default value.
	 * @return {string}
	 */
	getDefaultValue(): string;
	/**
	 * Update the value.
	 * The change is also propagated to the selected targets (eg. CSS rule).
	 * @param {String} value New value
	 * @param {Object} [opts={}] Options
	 * @param {Boolean} [opts.partial=false] If `true` the update on targets won't be considered complete (not stored in UndoManager)
	 * @param {Boolean} [opts.noTarget=false] If `true` the change won't be propagated to selected targets.
	 */
	upValue(value: string, opts?: OptionsUpdate): this;
	/**
	 * Check if the property is visible
	 * @returns {Boolean}
	 */
	isVisible(): boolean;
	/**
	 * Clear the value.
	 * The change is also propagated to the selected targets (eg. the css property is cleared).
	 * @param {Object} [opts={}] Options
	 * @param {Boolean} [opts.noTarget=false] If `true` the change won't be propagated to selected targets.
	 */
	clear(opts?: {}): this;
	/**
	 * Indicates if the current value comes directly from the selected target and so can be cleared.
	 * @returns {Boolean}
	 */
	canClear(): boolean;
	/**
	 * If the current property is a sub-property, this will return the parent Property.
	 * @returns {[Property]|null}
	 */
	getParent(): PropertyComposite<PropertyCompositeProps>;
	/**
	 * Indicates if the property is full-width in UI.
	 * @returns {Boolean}
	 */
	isFull(): boolean;
	__parseValue(value: string, opts: any): Partial<T>;
	__getClearProps(): Partial<T>;
	/**
	 * Update value
	 * @param {any} value
	 * @param {Boolen} [complete=true] Indicates if it's a final state
	 * @param {Object} [opts={}] Options
	 * @private
	 */
	setValue(value: string, complete?: boolean, opts?: {}): void;
	/**
	 * Like `setValue` but, in addition, prevents the update of the input element
	 * as the changes should come from the input itself.
	 * This method is useful with the definition of custom properties
	 * @param {any} value
	 * @param {Boolen} [complete=true] Indicates if it's a final state
	 * @param {Object} [opts={}] Options
	 * @private
	 * @deprecated
	 */
	setValueFromInput(value: string, complete: boolean, opts?: {}): void;
	/**
	 * Parse a raw value, generally fetched from the target, for this property
	 * @param  {string} value Raw value string
	 * @return {Object}
	 * @private
	 * @example
	 * // example with an Input type
	 * prop.parseValue('translateX(10deg)');
	 * // -> { value: 10, unit: 'deg', functionName: 'translateX' }
	 *
	 */
	parseValue(value: string, opts?: {
		complete?: boolean;
		numeric?: boolean;
	}): Partial<T>;
	/**
	 * Helper function to safely split a string of values.
	 * Useful when style values are inside functions
	 * eg:
	 * -> input: 'value(1,2,4), 123, value(4,5)' -- default separator: ','
	 * -> output: ['value(1,2,4)', '123', 'value(4,5)']
	 * @param {String} values Values to split
	 * @param {String} [separator] Separator
	 * @private
	 */
	__getFullValue({ withDefault }?: any): string;
	/**
	 * Get a complete value of the property.
	 * This probably will replace the getValue when all
	 * properties models will be splitted
	 * @param {String} val Custom value to replace the one on the model
	 * @return {string}
	 * @private
	 */
	getFullValue(val?: string, opts?: any): string;
	__setParentTarget(parentTarget: any): void;
	getParentTarget(): NonNullable<T["parentTarget"]> | null;
	__parseFn(input?: string): {
		name: string;
		value: string;
	};
	__checkVisibility({ target, component, sectors }: {
		target: any;
		component?: Component;
		sectors?: Sector[];
	}): boolean;
}
/** @private */
export interface SectorProperties {
	id?: string;
	name: string;
	open?: boolean;
	visible?: boolean;
	buildProps?: string[];
	extendBuilded?: boolean;
	properties?: PropertyTypes[];
}
/**
 *
 * [Property]: property.html
 *
 * @typedef Sector
 * @property {String} id Sector id, eg. `typography`
 * @property {String} name Sector name, eg. `Typography`
 * @property {Boolean} [open=true] Indicates the open state.
 * @property {Array<Object>} [properties=[]] Indicate an array of Property defintions.
 */
export declare class Sector extends Model<SectorProperties> {
	em: EditorModel;
	defaults(): {
		id: string;
		name: string;
		open: boolean;
		visible: boolean;
		extendBuilded: boolean;
		properties: never[];
	};
	/**
	 * @hideconstructor
	 */
	constructor(prp: SectorProperties, opts?: {
		em?: EditorModel;
	});
	get properties(): Collection<Property<PropertyProps>>;
	/**
	 * Get sector id.
	 * @returns {String}
	 */
	getId(): string;
	/**
	 * Get sector name.
	 * @returns {String}
	 */
	getName(): string;
	/**
	 * Update sector name.
	 * @param {String} value New sector name
	 */
	setName(value: string): this;
	/**
	 * Check if the sector is open
	 * @returns {Boolean}
	 */
	isOpen(): boolean;
	/**
	 * Update Sector open state
	 * @param {Boolean} value
	 */
	setOpen(value: boolean): this;
	/**
	 * Check if the sector is visible
	 * @returns {Boolean}
	 */
	isVisible(): boolean;
	/**
	 * Get sector properties.
	 * @param {Object} [opts={}] Options
	 * @param {Boolean} [opts.withValue=false] Get only properties with value
	 * @param {Boolean} [opts.withParentValue=false] Get only properties with parent value
	 * @returns {Array<[Property]>}
	 */
	getProperties(opts?: {
		withValue?: boolean;
		withParentValue?: boolean;
	}): Property<PropertyProps>[];
	getProperty(id: string): Property | undefined;
	addProperty(property: PropertyTypes, opts: AddOptions): Property<PropertyProps>;
	/**
	 * Extend properties
	 * @param {Array<Object>} props Start properties
	 * @param {Array<Object>} moProps Model props
	 * @param {Boolean} ex Returns the same amount of passed model props
	 * @return {Array<Object>} Final props
	 * @private
	 */
	extendProperties(props: PropertyTypes[], moProps?: PropertyTypes[], ex?: boolean): PropertyTypes[];
	checkExtend(prop: any): PropertyTypes;
	/**
	 * Build properties
	 * @param {Array<string>} propr Array of props as sting
	 * @return {Array<Object>}
	 * @private
	 */
	buildProperties(props: string | string[]): PropertyTypes[];
}
export declare class Sectors extends Collection<Sector> {
	em: EditorModel;
	module: any;
	initialize(prop: any, opts?: {
		em?: EditorModel;
		module?: any;
	}): void;
	/** @ts-ignore */
	model(props: any, opts?: {}): Sector;
	onReset(models: any, opts?: {
		previousModels?: Sector[];
	}): void;
}
export declare const Properties: any;
export type Option = {
	id: string;
	label?: string;
};
declare class PropertyFactory {
	props: Record<string, PropertyProps | undefined>;
	typeNumber: string;
	typeColor: string;
	typeRadio: string;
	typeSelect: string;
	typeFile: string;
	typeSlider: string;
	typeComposite: string;
	typeStack: string;
	unitsSize: string[];
	unitsSizeNoPerc: string[];
	unitsTime: string[];
	unitsAngle: string[];
	fixedValues: string[];
	optsBgSize: Option[];
	optsBgAttach: Option[];
	optsBgRepeat: Option[];
	optsWrap: Option[];
	optsOverflow: Option[];
	optsDir: Option[];
	opstDisplay: Option[];
	optsTransitFn: Option[];
	optsCursor: Option[];
	optsFloat: Option[];
	optsPos: Option[];
	optsTextAlign: Option[];
	optsFlexAlign: Option[];
	optsJustCont: Option[];
	optsAlignCont: Option[];
	optsAlignSelf: Option[];
	optsTransitProp: Option[];
	optsBorderStyle: Option[];
	optsBgPos: Option[];
	optsWeight: Option[];
	optsShadowType: Option[];
	optsFonts: Option[];
	fixedFontSizes: string[];
	fixedLetSpace: string[];
	requireFlex: Record<string, any>;
	constructor();
	__sub(items: (string | PropertyProps)[]): () => PropertyProps[];
	init(): this;
	add(property: string, def?: Record<string, any>, opts?: {
		from?: string;
	}): any;
	get(prop: string): PropertyProps | undefined;
	/**
	 * Build props object by their name
	 * @param  {Array<string>|string} props Array of properties name
	 * @return {Array<Object>}
	 */
	build(props: string | string[]): PropertyProps[];
}
declare class SectorsView extends View {
	pfx: string;
	ppfx: string;
	config: StyleManagerConfig;
	module: any;
	constructor(o?: {
		module?: any;
		config?: StyleManagerConfig;
		el?: HTMLElement;
		em?: EditorModel;
		collection?: Sectors;
	});
	remove(): this;
	addTo(model: Sector, c: any, opts?: {}): void;
	addToCollection(model: Sector, fragmentEl: DocumentFragment | null, opts?: {
		at?: number;
	}): HTMLElement;
	render(): this;
}
export interface ICustomPropertyView {
	create?: (data: ReturnType<PropertyView["_getClbOpts"]>) => any;
	destroy?: (data: ReturnType<PropertyView["_getClbOpts"]>) => any;
	update?: (data: ReturnType<PropertyView["_getClbOpts"]> & {
		value: string;
	}) => any;
	emit?: (data: ReturnType<PropertyView["_getClbOpts"]>, ...args: any) => any;
	unset?: (data: ReturnType<PropertyView["_getClbOpts"]>) => any;
}
export type CustomPropertyView<T> = ICustomPropertyView & T & ThisType<T & PropertyView>;
declare class PropertyView extends View<Property> {
	em: EditorModel;
	pfx: string;
	ppfx: string;
	config: any;
	parent?: PropertyView;
	__destroyFn: Function;
	create?: Function;
	destroy?: Function;
	update?: Function;
	emit?: Function;
	unset?: Function;
	clearEl?: HTMLElement;
	createdEl?: HTMLElement;
	input?: HTMLInputElement;
	$input?: any;
	constructor(o?: {});
	events(): {
		change: string;
		"click [data-clear-style]": string;
	};
	template(model: any): string;
	templateLabel(model: Property): string;
	templateInput(model: Property): string;
	remove(): this;
	/**
	 * Triggers when the status changes. The status indicates if the value of
	 * the proprerty is changed or inherited
	 * @private
	 */
	updateStatus(): void;
	/**
	 * Clear the property from the target
	 */
	clear(ev: Event): void;
	/**
	 * Get clear element
	 * @return {HTMLElement}
	 */
	getClearEl(): HTMLElement;
	/**
	 * Triggers when the value of element input/s is changed, so have to update
	 * the value of the model which will propogate those changes to the target
	 */
	inputValueChanged(ev: any): void;
	onValueChange(m: any, val: any, opt?: any): void;
	/**
	 * Update the element input.
	 * Usually the value is a result of `model.getFullValue()`
	 * @param {String} value The value from the model
	 * */
	setValue(value: string): void;
	__setValueInput(value: string): void;
	getInputEl(): HTMLInputElement;
	updateVisibility(): void;
	clearCached(): void;
	__unset(): void;
	__update(value: string): void;
	__change(...args: any): void;
	__updateStyle(value: string | StyleProps, { complete, partial, ...opts }?: any): void;
	_getClbOpts(): {
		el: HTMLElement;
		createdEl: HTMLElement | undefined;
		property: Property<PropertyProps>;
		props: Partial<PropertyProps>;
		change: (...args: any) => void;
		updateStyle: (value: string | StyleProps, { complete, partial, ...opts }?: any) => void;
	};
	render(): this;
	onRender(): void;
}
declare class PropertiesView extends View {
	config?: any;
	pfx: string;
	properties: PropertyView[];
	parent?: PropertyView;
	constructor(o: any);
	addTo(model: any, coll: any, opts: any): void;
	add(model: any, frag: DocumentFragment | null, opts?: any): void;
	remove(): this;
	clearItems(): void;
	render(): this;
}
declare class PropertyCompositeView extends PropertyView {
	props?: PropertiesView;
	templateInput(): string;
	remove(): this;
	onValueChange(): void;
	onRender(): void;
	clearCached(): void;
}
declare class LayersView extends View<Layer> {
	pfx: string;
	ppfx: string;
	config: any;
	propertyView: PropertyStackView;
	items: LayerView[];
	sorter: any;
	constructor(o: any);
	addTo(model: Layer): void;
	addToCollection(model: Layer, fragmentEl: DocumentFragment | null, index?: number): HTMLElement;
	reset(coll: any, opts: any): void;
	remove(): this;
	clearItems(): void;
	render(): this;
}
declare class PropertyStackView extends PropertyCompositeView {
	model: PropertyStack;
	layersView?: LayersView;
	events(): {
		"click [data-add-layer]": string;
		change: string;
		"click [data-clear-style]": string;
	};
	templateInput(): string;
	init(): void;
	addLayer(): void;
	/**
	 * There is no need to handle input update by the property itself,
	 * this will be done by layers
	 * @private
	 */
	setValue(): void;
	remove(): this;
	clearCached(): void;
	onRender(): void;
}
declare class LayerView extends View<Layer> {
	pfx: string;
	ppfx: string;
	em: EditorModel;
	propertyView: PropertyStackView;
	propsWrapEl?: HTMLElement;
	previewEl?: HTMLElement;
	labelEl?: HTMLElement;
	sorter: any;
	config: any;
	events(): {
		click: string;
		"click [data-close-layer]": string;
		"mousedown [data-move-layer]": string;
		"touchstart [data-move-layer]": string;
	};
	template(): string;
	initialize(o?: any): void;
	initSorter(): void;
	removeItem(ev: Event): void;
	select(): void;
	getPropertiesWrapper(): HTMLElement;
	getPreviewEl(): HTMLElement;
	getLabelEl(): HTMLElement;
	updateLabel(): void;
	updateVisibility(): void;
	render(): this;
}
export type LayerValues = Record<string, any>;
export interface LayerProps {
	values: LayerValues;
}
declare class Layer extends Model<LayerProps> {
	prop: any;
	view?: LayerView;
	defaults(): {
		values: {};
	};
	initialize(): void;
	/**
	 * Get layer id.
	 * @returns {String}
	 */
	getId(): string;
	/**
	 * Get layer index.
	 * @returns {Number}
	 */
	getIndex(): number;
	/**
	 * Get layer values.
	 * @param {Object} [opts={}] Options
	 * @param {Boolean} [opts.camelCase] Return property names in camelCase.
	 * @returns {Object}
	 */
	getValues(opts?: {
		camelCase?: boolean;
	}): LayerValues;
	/**
	 * Get layer label.
	 * @returns {String}
	 */
	getLabel(): string;
	/**
	 * Check if the layer is selected.
	 * @returns {Boolean}
	 */
	isSelected(): boolean;
	/**
	 * Select the layer.
	 */
	select(): any;
	/**
	 * Remove the layer.
	 */
	remove(): any;
	/**
	 * Move layer to a new index.
	 * @param {Number} index New index
	 */
	move(index: number): any;
	/**
	 * Get style object for the preview.
	 * @param {Object} [opts={}] Options. Same of `PropertyStack.getStyleFromLayer`
	 * @returns {Object} Style object
	 */
	getStylePreview(opts?: OptionStyleStack): Record<string, any>;
	/**
	 * Check if the property has the preview enabled for this layer.
	 * @returns {Boolean}
	 */
	hasPreview(): boolean;
	upValues(props?: LayerValues): this;
}
declare class Layers extends Collection<Layer> {
	prop: any;
	initialize(p: any, opts?: {
		prop?: any;
	}): void;
}
export type ToStyleDataStack = Omit<ToStyleData, "property"> & {
	joinLayers: string;
	layer: Layer;
	property: PropertyStack;
};
export type FromStyleDataStack = Omit<FromStyleData, "property" | "separator"> & {
	property: PropertyStack;
	separatorLayers: RegExp;
};
export type OptionStyleStack = OptionsStyle & {
	number?: {
		min?: number;
		max?: number;
	};
	__clear?: boolean;
};
/** @private */
export interface PropertyStackProps extends Omit<PropertyCompositeProps, "toStyle" | "fromStyle"> {
	layers?: LayerProps[];
	/**
	 * The separator used to split layer values.
	 */
	layerSeparator?: string | RegExp;
	/**
	 * Value used to join layer values.
	 */
	layerJoin?: string;
	/**
	 * Indicate if the layer should display a preview.
	 */
	preview?: boolean;
	/**
	 * Custom logic for creating layer labels.
	 */
	layerLabel?: (layer: Layer, data: {
		index: number;
		values: LayerValues;
		property: PropertyStack;
	}) => string;
	/**
	 * Empty value to apply when all layers are removed.
	 * @default 'unset'
	 * @example
	 * // use simple string
	 * emptyValue: 'inherit',
	 * // or a function for a custom style object
	 * emptyValue: () => ({
	 *  color: 'unset',
	 *  width: 'auto'
	 * }),
	 */
	emptyValue?: string | ((data: {
		property: PropertyStack;
	}) => PropValues);
	toStyle?: (values: PropValues, data: ToStyleDataStack) => ReturnType<ToStyle>;
	fromStyle?: (style: StyleProps, data: FromStyleDataStack) => ReturnType<FromStyle>;
	parseLayer?: (data: {
		value: string;
		values: PropValues;
	}) => PropValues;
	selectedLayer?: Layer;
	prepend?: boolean;
	__layers?: PropValues[];
	isEmptyValue?: boolean;
}
/**
 *
 * [Layer]: layer.html
 *
 *
 * @typedef PropertyStack
 * @property {Boolean} [preview=false] Indicate if the layer should display a preview.
 * @property {String|RegExp} [layerSeparator=', '] The separator used to split layer values.
 * @property {String} [layerJoin=', '] Value used to join layer values.
 * @property {Function} [layerLabel] Custom logic for creating layer labels.
 * \n
 * ```js
 *  layerLabel: (layer) => {
 *    const values = layer.getValues();
 *    return `A: ${values['prop-a']} B: ${values['prop-b']}`;
 *  }
 *  ```
 * @property {String|Function} [emptyValue='unset'] Empty value to apply when all layers are removed.
 * \n
 * ```js
 *  // use simple string
 *  emptyValue: 'inherit',
 *  // or a function for a custom style object
 *  emptyValue: () => ({
 *    color: 'unset',
 *    width: 'auto'
 *  }),
 *  ```
 *
 */
export declare class PropertyStack extends PropertyComposite<PropertyStackProps> {
	defaults(): any;
	initialize(props?: {}, opts?: {}): void;
	get layers(): Layers;
	/**
	 * Get all available layers.
	 * @returns {Array<[Layer]>}
	 */
	getLayers(): Layer[];
	/**
	 * Check if the property has layers.
	 * @returns {Boolean}
	 */
	hasLayers(): boolean;
	/**
	 * Get layer by index.
	 * @param {Number} [index=0] Layer index position.
	 * @returns {[Layer]|null}
	 * @example
	 * // Get the first layer
	 * const layerFirst = property.getLayer(0);
	 * // Get the last layer
	 * const layers = this.getLayers();
	 * const layerLast = property.getLayer(layers.length - 1);
	 */
	getLayer(index?: number): Layer | undefined;
	/**
	 * Get selected layer.
	 * @returns {[Layer] | undefined}
	 */
	getSelectedLayer(): Layer | undefined;
	/**
	 * Select layer.
	 * Without a selected layer any update made on inner properties has no effect.
	 * @param {[Layer]} layer Layer to select
	 * @example
	 * const layer = property.getLayer(0);
	 * property.selectLayer(layer);
	 */
	selectLayer(layer: Layer): this;
	/**
	 * Select layer by index.
	 * @param {Number} index Index of the layer to select.
	 * @example
	 * property.selectLayerAt(1);
	 */
	selectLayerAt(index?: number): this | undefined;
	/**
	 * Move layer by index.
	 * @param {[Layer]} layer Layer to move.
	 * @param {Number} index New layer index.
	 * @example
	 * const layer = property.getLayer(1);
	 * property.moveLayer(layer, 0);
	 */
	moveLayer(layer: Layer, index?: number): void;
	/**
	 * Add new layer to the stack.
	 * @param {Object} [props={}] Custom property values to use in a new layer.
	 * @param {Object} [opts={}] Options
	 * @param {Number} [opts.at] Position index (by default the layer will be appended at the end).
	 * @returns {[Layer]} Added layer.
	 * @example
	 * // Add new layer at the beginning of the stack with custom values
	 * property.addLayer({ 'sub-prop1': 'value1', 'sub-prop2': 'value2' }, { at: 0 });
	 */
	addLayer(props?: LayerValues, opts?: {}): Layer;
	/**
	 * Remove layer.
	 * @param {[Layer]} layer Layer to remove.
	 * @returns {[Layer]} Removed layer
	 * @example
	 * const layer = property.getLayer(0);
	 * property.removeLayer(layer);
	 */
	removeLayer(layer: Layer): Layer;
	/**
	 * Remove layer by index.
	 * @param {Number} index Index of the layer to remove
	 * @returns {[Layer]|null} Removed layer
	 * @example
	 * property.removeLayerAt(0);
	 */
	removeLayerAt(index?: number): Layer | null;
	/**
	 * Get the layer label. The label can be customized with the `layerLabel` property.
	 * @param {[Layer]} layer
	 * @returns {String}
	 * @example
	 * const layer = this.getLayer(1);
	 * const label = this.getLayerLabel(layer);
	 */
	getLayerLabel(layer: Layer): string;
	/**
	 * Get style object from the layer.
	 * @param {[Layer]} layer
	 * @param {Object} [opts={}] Options
	 * @param {Boolean} [opts.camelCase] Return property names in camelCase.
	 * @param {Object} [opts.number] Limit the result of the number types, eg. `number: { min: -3, max: 3 }`
	 * @returns {Object} Style object
	 */
	getStyleFromLayer(layer: Layer, opts?: OptionStyleStack): StyleProps;
	/**
	 * Get preview style object from the layer.
	 * If the property has `preview: false` the returned object will be empty.
	 * @param {[Layer]} layer
	 * @param {Object} [opts={}] Options. Same of `getStyleFromLayer`
	 * @returns {Object} Style object
	 */
	getStylePreview(layer: Layer, opts?: OptionStyleStack): {};
	/**
	 * Get layer separator.
	 * @return {RegExp}
	 */
	getLayerSeparator(): RegExp;
	/**
	 * Check if the property is with an empty value.
	 * @returns {Boolean}
	 */
	hasEmptyValue(): boolean;
	__upProperties(prop: Property, opts?: any): void;
	__upLayers(m: any, c: any, o: any): void;
	__upTargets(p: this, opts?: any): void;
	__upTargetsStyleProps(opts?: {}): void;
	__upTargetsStyle(style: StyleProps, opts: any): void;
	__upSelected({ noEvent }?: {
		noEvent?: boolean;
	}, opts?: OptionsUpdate): void;
	_up(props: Partial<PropertyStackProps>, opts?: OptionsUpdate): this;
	__setLayers(newLayers?: LayerValues[], opts?: {
		isEmptyValue?: boolean;
	}): void;
	__parseValue(value: string): Partial<PropertyStackProps>;
	__parseLayer(value: string): PropValues;
	__getLayersFromStyle(style?: StyleProps): LayerValues[] | null;
	getStyle(opts?: OptionStyleStack): {
		[x: string]: any;
	};
	getStyleFromLayers(opts?: OptionStyleStack): {
		[x: string]: any;
	};
	isEmptyValueStyle(style?: StyleProps): boolean;
	getEmptyValueStyle(opts?: {
		force?: boolean;
	}): PropValues;
	__getJoinLayers(): string;
	__getFullValue(): string;
	/**
	 * Extended
	 * @private
	 */
	hasValue(opts?: {
		noParent?: boolean;
	}): boolean;
	/**
	 * Extended
	 * @private
	 */
	clear(opts?: {}): this;
	__canClearProp(): boolean;
	/**
	 * @deprecated
	 * @private
	 */
	__getLayers(): Layers;
}
export type PropertyTypes = PropertyStackProps | PropertySelectProps | PropertyNumberProps;
export type StyleManagerEvent = "style:sector:add" | "style:sector:remove" | "style:sector:update" | "style:property:add" | "style:property:remove" | "style:property:update" | "style:target";
export type StyleTarget = StyleableModel;
export type StyleModuleParam<T extends keyof StyleManager, N extends number> = Parameters<StyleManager[T]>[N];
declare const stylesEvents: {
	all: string;
	sectorAdd: string;
	sectorRemove: string;
	sectorUpdate: string;
	propertyAdd: string;
	propertyRemove: string;
	propertyUpdate: string;
	layerSelect: string;
	target: string;
	custom: string;
};
declare class StyleManager extends ItemManagerModule<StyleManagerConfig, 
/** @ts-ignore */
Sectors> {
	builtIn: PropertyFactory;
	upAll: Debounced;
	properties: typeof Properties;
	events: typeof stylesEvents;
	sectors: Sectors;
	SectView: SectorsView;
	Sector: typeof Sector;
	storageKey: string;
	__ctn?: HTMLElement;
	/**
	 * Get configuration object
	 * @name getConfig
	 * @function
	 * @return {Object}
	 */
	/**
	 * Initialize module. Automatically called with a new instance of the editor
	 * @param {Object} config Configurations
	 * @private
	 */
	constructor(em: EditorModel);
	__upSel(): void;
	__trgCustom(opts?: {
		container?: HTMLElement;
	}): void;
	__trgEv(event: string, ...data: any[]): void;
	__clearStateTarget(): void;
	onLoad(): void;
	postRender(): void;
	/**
	 * Add new sector. If the sector with the same id already exists, that one will be returned.
	 * @param {String} id Sector id
	 * @param {Object} sector Sector definition. Check the [available properties](sector.html#properties)
	 * @param {Object} [options={}] Options
	 * @param {Number} [options.at] Position index (by default, will be appended at the end).
	 * @returns {[Sector]} Added Sector
	 * @example
	 * const sector = styleManager.addSector('mySector',{
	 *   name: 'My sector',
	 *   open: true,
	 *   properties: [{ name: 'My property'}]
	 * }, { at: 0 });
	 * // With `at: 0` we place the new sector at the beginning of the list
	 * */
	addSector(id: string, sector: SectorProperties, options?: AddOptions): Sector;
	/**
	 * Get sector by id.
	 * @param {String} id  Sector id
	 * @returns {[Sector]|null}
	 * @example
	 * const sector = styleManager.getSector('mySector');
	 * */
	getSector(id: string, opts?: {
		warn?: boolean;
	}): Sector;
	/**
	 * Get all sectors.
	 * @param {Object} [opts={}] Options
	 * @param {Boolean} [opts.visible] Returns only visible sectors
	 * @returns {Array<[Sector]>}
	 * @example
	 * const sectors = styleManager.getSectors();
	 * */
	getSectors<T extends {
		array?: boolean;
		visible?: boolean;
	}>(opts?: T): T["array"] extends true ? Sector[] : T["visible"] extends true ? Sector[] : Sectors;
	/**
	 * Remove sector by id.
	 * @param  {String} id Sector id
	 * @returns {[Sector]} Removed sector
	 * @example
	 * const removed = styleManager.removeSector('mySector');
	 */
	removeSector(id: string): Sector;
	/**
	 * Add new property to the sector.
	 * @param {String} sectorId Sector id.
	 * @param {Object} property Property definition. Check the [base available properties](property.html#properties) + others based on the `type` of your property.
	 * @param {Object} [opts={}] Options
	 * @param {Number} [opts.at] Position index (by default, will be appended at the end).
	 * @returns {[Property]|null} Added property or `null` in case the sector doesn't exist.
	 * @example
	 * const property = styleManager.addProperty('mySector', {
	 *   label: 'Minimum height',
	 *   property: 'min-height',
	 *   type: 'select',
	 *   default: '100px',
	 *   options: [
	 *    { id: '100px', label: '100' },
	 *    { id: '200px', label: '200' },
	 *   ],
	 * }, { at: 0 });
	 */
	addProperty(sectorId: string, property: PropertyTypes, opts?: AddOptions): Property | undefined;
	/**
	 * Get the property.
	 * @param {String} sectorId Sector id.
	 * @param {String} id Property id.
	 * @returns {[Property]|undefined}
	 * @example
	 * const property = styleManager.getProperty('mySector', 'min-height');
	 */
	getProperty(sectorId: string, id: string): Property | undefined;
	/**
	 * Get all properties of the sector.
	 * @param {String} sectorId Sector id.
	 * @returns {Collection<[Property]>|undefined} Collection of properties
	 * @example
	 * const properties = styleManager.getProperties('mySector');
	 */
	getProperties(sectorId: string): Collection<Property<PropertyProps>> | undefined;
	/**
	 * Remove the property.
	 * @param {String} sectorId Sector id.
	 * @param {String} id Property id.
	 * @returns {[Property]|null} Removed property
	 * @example
	 * const property = styleManager.removeProperty('mySector', 'min-height');
	 */
	removeProperty(sectorId: string, id: string): Property<PropertyProps> | null;
	/**
	 * Select new target.
	 * The target could be a Component, CSSRule, or a CSS selector string.
	 * @param {[Component]|[CSSRule]|String} target
	 * @returns {Array<[Component]|[CSSRule]>} Array containing selected Components or CSSRules
	 * @example
	 * // Select the first button in the current page
	 * const wrapperCmp = editor.Pages.getSelected().getMainComponent();
	 * const btnCmp = wrapperCmp.find('button')[0];
	 * btnCmp && styleManager.select(btnCmp);
	 *
	 * // Set as a target the CSS selector
	 * styleManager.select('.btn > span');
	 */
	select(target: StyleTarget | string | (StyleTarget | string)[], opts?: {
		stylable?: boolean;
		component?: Component;
	}): StyleTarget[];
	/**
	 * Get the last selected target.
	 * By default, the Style Manager shows styles of the last selected target.
	 * @returns {[Component]|[CSSRule]|null}
	 */
	getSelected(): StyleTarget | undefined;
	/**
	 * Get the array of selected targets.
	 * @returns {Array<[Component]|[CSSRule]>}
	 */
	getSelectedAll(): StyleTarget[];
	/**
	 * Get parent rules of the last selected target.
	 * @returns {Array<[CSSRule]>}
	 */
	getSelectedParents(): CssRule[];
	__getStateTarget(): CssRule | undefined;
	/**
	 * Update selected targets with a custom style.
	 * @param {Object} style Style object
	 * @param {Object} [opts={}] Options
	 * @example
	 * styleManager.addStyleTargets({ color: 'red' });
	 */
	addStyleTargets(style: StyleProps, opts: any): void;
	/**
	 * Return built-in property definition
	 * @param {String} prop Property name.
	 * @returns {Object|null} Property definition.
	 * @example
	 * const widthPropDefinition = styleManager.getBuiltIn('width');
	 */
	getBuiltIn(prop: string): PropertyProps | undefined;
	/**
	 * Get all the available built-in property definitions.
	 * @returns {Object}
	 */
	getBuiltInAll(): Record<string, PropertyProps | undefined>;
	/**
	 * Add built-in property definition.
	 * If the property exists already, it will extend it.
	 * @param {String} prop Property name.
	 * @param {Object} definition Property definition.
	 * @returns {Object} Added property definition.
	 * @example
	 * const sector = styleManager.addBuiltIn('new-property', {
	 *  type: 'select',
	 *  default: 'value1',
	 *  options: [{ id: 'value1', label: 'Some label' }, ...],
	 * })
	 */
	addBuiltIn(prop: string, definition: Omit<PropertyProps, "property"> & {
		proeperty?: "string";
	}): any;
	/**
	 * Get what to style inside Style Manager. If you select the component
	 * without classes the entity is the Component itself and all changes will
	 * go inside its 'style' property. Otherwise, if the selected component has
	 * one or more classes, the function will return the corresponding CSS Rule
	 * @param  {Model} model
	 * @return {Model}
	 * @private
	 */
	getModelToStyle(model: any, options?: {
		skipAdd?: boolean;
		useClasses?: boolean;
	}): any;
	getParentRules(target: StyleTarget, { state, component }?: {
		state?: string;
		component?: Component;
	}): CssRule[];
	/**
	 * Add new property type
	 * @param {string} id Type ID
	 * @param {Object} definition Definition of the type.
	 * @example
	 * styleManager.addType('my-custom-prop', {
	 *    // Create UI
	 *    create({ props, change }) {
	 *      const el = document.createElement('div');
	 *      el.innerHTML = '<input type="range" class="my-input" min="10" max="50"/>';
	 *      const inputEl = el.querySelector('.my-input');
	 *      inputEl.addEventListener('change', event => change({ event }));
	 *      inputEl.addEventListener('input', event => change({ event, partial: true }));
	 *      return el;
	 *    },
	 *    // Propagate UI changes up to the targets
	 *    emit({ props, updateStyle }, { event, partial }) {
	 *      const { value } = event.target;
	 *      updateStyle(`${value}px`, { partial });
	 *    },
	 *    // Update UI (eg. when the target is changed)
	 *    update({ value, el }) {
	 *      el.querySelector('.my-input').value = parseInt(value, 10);
	 *    },
	 *    // Clean the memory from side effects if necessary (eg. global event listeners, etc.)
	 *    destroy() {}
	 *})
	 */
	addType<T>(id: string, definition: CustomPropertyView<T>): void;
	/**
	 * Get type
	 * @param {string} id Type ID
	 * @return {Object} Type definition
	 */
	getType(id: string): any;
	/**
	 * Get all types
	 * @return {Array}
	 */
	getTypes(): any;
	/**
	 * Create new UI property from type (Experimental)
	 * @param {string} id Type ID
	 * @param  {Object} [options={}] Options
	 * @param  {Object} [options.model={}] Custom model object
	 * @param  {Object} [options.view={}] Custom view object
	 * @return {PropertyView}
	 * @private
	 * @example
	 * const propView = styleManager.createType('number', {
	 *  model: {units: ['px', 'rem']}
	 * });
	 * propView.render();
	 * propView.model.on('change:value', ...);
	 * someContainer.appendChild(propView.el);
	 */
	createType(id: string, { model, view }?: {
		model?: {} | undefined;
		view?: {} | undefined;
	}): any;
	/**
	 * Render sectors and properties
	 * @return  {HTMLElement}
	 * @private
	 * */
	render(): HTMLElement;
	_logNoSector(sectorId: string): void;
	__emitCmpStyleUpdate(style: StyleProps, opts?: {
		components?: Component | Component[];
	}): void;
	__upProps(opts?: {}): void;
	__upProp(prop: Property, style: StyleProps, parentStyles: any[], opts: any): void;
	destroy(): void;
}
export interface StyleManagerConfig {
	/**
	 * Default sectors and properties
	 */
	sectors?: (Omit<SectorProperties, "properties"> & {
		properties?: (string | PropertyTypes)[];
	})[];
	/**
	 * Specify the element to use as a container, string (query) or HTMLElement.
	 * With the empty value, nothing will be rendered.
	 */
	appendTo?: string | HTMLElement;
	/**
	 * Style prefix.
	 * @default 'sm-'
	 */
	stylePrefix?: string;
	/**
	 * Avoid rendering the default style manager.
	 * @default false
	 */
	custom?: boolean;
	/**
	 * Hide the property in case it's not stylable for the
	 * selected component (each component has 'stylable' property).
	 * @deprecated
	 */
	hideNotStylable?: boolean;
	/**
	 * Highlight changed properties of the selected component.
	 * @deprecated
	 */
	highlightChanged?: boolean;
	/**
	 * Highlight computed properties of the selected component.
	 * @deprecated
	 */
	highlightComputed?: boolean;
	/**
	 * Show computed properties of the selected component, if this value
	 * is set to false, highlightComputed will not take effect.
	 * @deprecated
	 */
	showComputed?: boolean;
	/**
	 * Adds the possibility to clear property value from the target style.
	 * @deprecated
	 */
	clearProperties?: boolean;
	/**
	 * Properties not to take in account for computed styles.
	 * @deprecated
	 */
	avoidComputed?: string[];
	pStylePrefix?: string;
}
export type HTMLGeneratorBuildOptions = {
	/**
	 * Remove unnecessary IDs (eg. those created automatically).
	 */
	cleanId?: boolean;
	/**
	 * You can pass an object of custom attributes to replace with the current ones
	 * or you can even pass a function to generate attributes dynamically.
	 */
	attributes?: Record<string, any> | ((component: Component, attr: Record<string, any>) => Record<string, any>);
};
export type CssGeneratorBuildOptions = {
	/**
	 * Return an array of CssRules instead of the CSS string.
	 */
	json?: boolean;
	/**
	 * Return only rules matched by the passed component.
	 */
	onlyMatched?: boolean;
	/**
	 * Force keep all defined rules. Toggle on in case output looks different inside/outside of the editor.
	 */
	keepUnusedStyles?: boolean;
	rules?: CssRule[];
	clearStyles?: boolean;
};
export interface ColorPickerOptions {
	beforeShow?: () => void;
	move?: () => void;
	change?: () => void;
	show?: () => void;
	hide?: () => void;
	color?: boolean;
	flat?: boolean;
	showInput?: boolean;
	allowEmpty?: boolean;
	showButtons?: boolean;
	clickoutFiresChange?: boolean;
	showInitial?: boolean;
	showPalette?: boolean;
	showPaletteOnly?: boolean;
	hideAfterPaletteSelect?: boolean;
	togglePaletteOnly?: boolean;
	showSelectionPalette?: boolean;
	localStorageKey?: boolean;
	appendTo?: string;
	maxSelectionSize?: number;
	cancelText?: string;
	chooseText?: string;
	togglePaletteMoreText?: string;
	togglePaletteLessText?: string;
	clearText?: string;
	noColorSelectedText?: string;
	preferredFormat?: boolean;
	containerClassName?: string;
	replacerClassName?: string;
	showAlpha?: boolean;
	theme?: string;
	palette?: string[][];
	selectionPalette?: string[];
	disabled?: boolean;
	offset?: {
		top: number;
		left: number;
	};
}
export interface EditorConfig {
	/**
	 * Style class name prefix.
	 * @default 'gjs-'
	 */
	stylePrefix?: string;
	/**
	 * Selector which indicates where render the editor.
	 */
	container?: string | HTMLElement;
	/**
	 * If true, auto-render the content
	 * @default true
	 */
	autorender?: boolean;
	/**
	 * Array of plugins to execute on start.
	 * @default []
	 */
	plugins?: (string | Plugin<any>)[];
	/**
	 * Custom options for plugins
	 * @default {}
	 */
	pluginsOpts?: Record<string, any>;
	/**
	 * Init headless editor.
	 * @default false
	 */
	headless?: boolean;
	/**
	 * Initial project data (JSON containing your components/styles/etc) to load.
	 */
	projectData?: ObjectAny;
	/**
	 * HTML string or object of components
	 * @deprecated Rely on `projectData` option
	 * @default ''
	 */
	components?: string;
	/**
	 * CSS string or object of rules
	 * @deprecated Rely on `projectData` option
	 * @default ''
	 */
	style?: string;
	/**
	 * If true, will fetch HTML and CSS from the selected container.
	 * @deprecated
	 * @default false
	 */
	fromElement?: boolean;
	/**
	 * Show an alert before unload the page with unsaved changes
	 * @default true
	 */
	noticeOnUnload?: boolean;
	/**
	 * Show paddings and margins.
	 * @default false
	 */
	showOffsets?: boolean;
	/**
	 * Show paddings and margins on selected component
	 * @default false
	 */
	showOffsetsSelected?: boolean;
	/**
	 * On creation of a new Component (via object), if the 'style' attribute is not
	 * empty, all those roles will be moved in its new class.
	 * @default true
	 */
	forceClass?: boolean;
	/**
	 * Height for the editor container
	 * @default '900px'
	 */
	height?: string;
	/**
	 * Width for the editor container
	 * @default '100%'
	 */
	width?: string;
	/**
	 * Type of logs to print with the logger (by default is used the devtool console).
	 * Available by default: debug, info, warning, error.
	 * You can use `false` to disable all of them or `true` to print all of them.
	 * @default ['warning', 'error']
	 */
	log?: ("debug" | "info" | "warning" | "error")[] | boolean;
	/**
	 * By default Grapes injects base CSS into the canvas. For example, it sets body margin to 0
	 * and sets a default background color of white. This CSS is desired in most cases.
	 * use this property if you wish to overwrite the base CSS to your own CSS. This is most
	 * useful if for example your template is not based off a document with 0 as body margin.
	 * @deprecated in favor of `config.canvas.frameStyle`
	 * @default ''
	 */
	baseCss?: string;
	/**
	 * CSS that could only be seen (for instance, inside the code viewer)
	 * @default '* { box-sizing: border-box; } body {margin: 0;}'
	 */
	protectedCss?: string;
	/**
	 * CSS for the iframe which containing the canvas, useful if you need to customize
	 * something inside (eg. the style of the selected component).
	 * @default ''
	 */
	canvasCss?: string;
	/**
	 * Default command
	 * @default 'select-comp'
	 */
	defaultCommand?: string;
	/**
	 * Show a toolbar when the component is selected
	 * @default true
	 */
	showToolbar?: boolean;
	/**
	 * If true render a select of available devices
	 * @default true
	 */
	showDevices?: boolean;
	/**
	 * When enabled, on device change media rules won't be created
	 * @default false
	 */
	devicePreviewMode?: boolean;
	/**
	 * The condition to use for media queries, eg. 'max-width'.
	 * Comes handy for mobile-first cases.
	 * @default 'max-width'
	 */
	mediaCondition?: string;
	/**
	 * Starting tag for variable inside scripts in Components
	 * @deprecated Rely on 'script-props' https://grapesjs.com/docs/modules/Components-js.html#passing-properties-to-scripts
	 * @default '{[ '
	 */
	tagVarStart?: string;
	/**
	 * Ending tag for variable inside scripts in Components
	 * @deprecated Rely on 'script-props' https://grapesjs.com/docs/modules/Components-js.html#passing-properties-to-scripts
	 * @default ' ]}'
	 */
	tagVarEnd?: string;
	/**
	 * When false, removes empty text nodes when parsed, unless they contain a space.
	 * @default false
	 */
	keepEmptyTextNodes?: boolean;
	/**
	 * Return JS of components inside HTML from 'editor.getHtml()'.
	 * @default true
	 */
	jsInHtml?: boolean;
	/**
	 * Enable native HTML5 drag and drop.
	 * @default true
	 */
	nativeDnD?: boolean;
	/**
	 * Enable multiple component selection.
	 * @default true
	 */
	multipleSelection?: boolean;
	/**
	 * Pass default available options wherever `editor.getHtml()` is called.
	 * @default {}
	 */
	optsHtml?: HTMLGeneratorBuildOptions;
	/**
	 * Pass default available options wherever `editor.getCss()` is called
	 * @default {}
	 */
	optsCss?: CssGeneratorBuildOptions;
	/**
	 * Usually when you update the `style` of the component this changes the
	 * element's `style` attribute. Unfortunately, inline styling doesn't allow
	 * use of media queries (@media) or even pseudo selectors (eg. :hover).
	 * When `avoidInlineStyle` is true all styles are inserted inside the css rule
	 * @deprecated Don't use this option, we don't support inline styling anymore.
	 */
	avoidInlineStyle?: boolean;
	/**
	 * Avoid default properties from storable JSON data, like `components` and `styles`.
	 * With this option enabled your data will be smaller (usefull if need to
	 * save some storage space).
	 * @default true
	 */
	avoidDefaults?: boolean;
	/**
	 * (experimental)
	 * The structure of components is always on the screen but it's not the same
	 * for style rules. When you delete a component you might leave a lot of styles
	 * which will never be used again, therefore they might be removed.
	 * With this option set to true, styles not used from the CSS generator (so in
	 * any case where `CssGenerator.build` is used) will be removed automatically.
	 * But be careful, not always leaving the style not used mean you wouldn't
	 * use it later, but this option comes really handy when deal with big templates.
	 * @default false
	 */
	clearStyles?: boolean;
	/**
	 * Specify the global drag mode of components. By default, components are moved
	 * following the HTML flow. Two other options are available:
	 * 'absolute' - Move components absolutely (design tools way)
	 * 'translate' - Use translate CSS from transform property
	 * To get more about this feature read: https://github.com/GrapesJS/grapesjs/issues/1936.
	 */
	dragMode?: "translate" | "absolute";
	/**
	 * When the editor is placed in a scrollable container (eg. modals) this might
	 * cause elements inside the canvas (eg. floating toolbars) to be misaligned.
	 * To avoid that, you can specify an array of DOM elements on which their scroll will
	 * trigger the canvas update.
	 * Be default, if the array is empty, the first parent element will be appended.
	 * listenToEl: [document.querySelector('#scrollable-el')],
	 * @default []
	 * */
	listenToEl?: HTMLElement[];
	/**
	 * Import asynchronously CSS to use as icons.
	 * @default 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'
	 * */
	cssIcons?: string;
	/**
	 * Experimental: don't use.
	 * Editor icons
	 */
	icons?: ObjectAny;
	/**
	 * Configurations for I18n.
	 */
	i18n?: I18nConfig;
	/**
	 * Configurations for Undo Manager
	 */
	undoManager?: UndoManagerConfig | boolean;
	/**
	 * Configurations for Asset Manager.
	 */
	assetManager?: AssetManagerConfig;
	/**
	 * Configurations for Canvas.
	 */
	canvas?: CanvasConfig;
	/**
	 * Configurations for Storage Manager.
	 */
	storageManager?: StorageManagerConfig | boolean;
	/**
	 * Configurations for Rich Text Editor.
	 */
	richTextEditor?: RichTextEditorConfig;
	/**
	 * Configurations for DomComponents
	 */
	domComponents?: DomComponentsConfig;
	/**
	 * Configurations for Modal Dialog.
	 */
	modal?: ModalConfig;
	/**
	 * Configurations for Code Manager.
	 */
	codeManager?: CodeManagerConfig;
	/**
	 * Configurations for Panels.
	 */
	panels?: PanelsConfig;
	/**
	 * Configurations for Commands.
	 */
	commands?: CommandsConfig;
	/**
	 * Configurations for Css Composer.
	 */
	cssComposer?: CssComposerConfig;
	/**
	 * Configurations for Selector Manager.
	 */
	selectorManager?: SelectorManagerConfig;
	/**
	 * Configurations for Device Manager.
	 */
	deviceManager?: DeviceManagerConfig;
	/**
	 * Configurations for Style Manager.
	 */
	styleManager?: StyleManagerConfig;
	/**
	 * Configurations for Block Manager.
	 */
	blockManager?: BlockManagerConfig;
	/**
	 * Configurations for Trait Manager.
	 */
	traitManager?: TraitManagerConfig;
	/**
	 * Configurations for Page Manager.
	 */
	pageManager?: PageManagerConfig;
	/**
	 * Configurations for Layer Manager.
	 */
	layerManager?: LayerManagerConfig;
	/**
	 * Configurations for Parser module.
	 */
	parser?: ParserConfig;
	/** Texts **/
	textViewCode?: string;
	/**
	 * Keep unused styles within the editor.
	 * @default false
	 */
	keepUnusedStyles?: boolean;
	/**
	 * Experimental: don't use.
	 * Avoid default UI styles.
	 */
	customUI?: boolean;
	el?: HTMLElement;
	/**
	 * Color picker options.
	 */
	colorPicker?: ColorPickerOptions;
	pStylePrefix?: string;
}
export type EditorConfigKeys = keyof EditorConfig;
export interface BlocksByCategory extends ItemsByCategory<Block> {
}
declare enum BlocksEvents {
	/**
	 * @event `block:add` New block added to the collection. The [Block] is passed as an argument to the callback.
	 * @example
	 * editor.on('block:add', (block) => { ... });
	 */
	add = "block:add",
	/**
	 * @event `block:remove` Block removed from the collection. The [Block] is passed as an argument to the callback.
	 * @example
	 * editor.on('block:remove', (block) => { ... });
	 */
	remove = "block:remove",
	/**
	 * @event `block:remove:before` Event triggered before Block remove.
	 * @example
	 * editor.on('block:remove:before', (block, remove, opts) => { ... });
	 */
	removeBefore = "block:remove:before",
	/**
	 * @event `block:update` Block updated. The [Block] and the object containing changes are passed as arguments to the callback.
	 * @example
	 * editor.on('block:update', (block, updatedProps) => { ... });
	 */
	update = "block:update",
	/**
	 * @event `block:drag:start` Started dragging block. The [Block] is passed as an argument.
	 * @example
	 * editor.on('block:drag:start', (block) => { ... });
	 */
	dragStart = "block:drag:start",
	/**
	 * @event `block:drag` The block is dragging. The [Block] is passed as an argument.
	 * @example
	 * editor.on('block:drag', (block) => { ... });
	 */
	drag = "block:drag",
	/**
	 * @event `block:drag:stop` Dragging of the block is stopped. The dropped [Component] (if dropped successfully) and the [Block] are passed as arguments.
	 * @example
	 * editor.on('block:drag:stop', (component, block) => { ... });
	 */
	dragEnd = "block:drag:stop",
	/**
	 * @event `block:custom` Event to use in case of [custom Block Manager UI](https://grapesjs.com/docs/modules/Blocks.html#customization).
	 * @example
	 * editor.on('block:custom', ({ container, blocks, ... }) => { ... });
	 */
	custom = "block:custom",
	/**
	 * @event `block` Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback.
	 * @example
	 * editor.on('block', ({ event, model, ... }) => { ... });
	 */
	all = "block"
}
export interface BlocksViewConfig {
	em: EditorModel;
	pStylePrefix?: string;
	ignoreCategories?: boolean;
	getSorter?: any;
}
declare class BlocksView extends View {
	em: EditorModel;
	config: BlocksViewConfig;
	categories: Categories;
	renderedCategories: Map<string, CategoryView>;
	ppfx: string;
	noCatClass: string;
	blockContClass: string;
	catsClass: string;
	catsEl?: HTMLElement;
	blocksEl?: HTMLElement;
	rendered?: boolean;
	sorter: any;
	constructor(opts: any, config: BlocksViewConfig);
	__getModule(): BlockManager;
	updateConfig(opts?: {}): void;
	/**
	 * Get sorter
	 * @private
	 */
	getSorter(): any;
	onDrag(ev: Event): void;
	onMove(ev: Event): void;
	onDrop(component?: Component): void;
	/**
	 * Add new model to the collection
	 * @param {Model} model
	 * @private
	 * */
	addTo(model: Block): void;
	/**
	 * Render new model inside the view
	 * @param {Model} model
	 * @param {Object} fragment Fragment collection
	 * @private
	 * */
	add(model: Block, fragment?: DocumentFragment): void;
	getCategoriesEl(): HTMLElement;
	getBlocksEl(): HTMLElement;
	append(el: HTMLElement | DocumentFragment): void;
	render(): this;
}
export type BlockEvent = `${BlocksEvents}`;
declare class BlockManager extends ItemManagerModule<BlockManagerConfig, Blocks> {
	blocks: Blocks;
	blocksVisible: Blocks;
	categories: Categories;
	blocksView?: BlocksView;
	_dragBlock?: Block;
	_bhv?: Record<string, any>;
	events: typeof BlocksEvents;
	Block: typeof Block;
	Blocks: typeof Blocks;
	Category: typeof Category;
	Categories: typeof Categories;
	storageKey: string;
	constructor(em: EditorModel);
	/**
	 * Get configuration object
	 * @name getConfig
	 * @function
	 * @return {Object}
	 */
	__trgCustom(): void;
	__customData(): {
		bm: BlockManager;
		blocks: Block[];
		container: any;
		dragStart: (block: Block, ev?: Event) => void;
		drag: (ev: Event) => void;
		dragStop: (cancel?: boolean) => void;
	};
	__startDrag(block: Block, ev?: Event): void;
	__drag(ev: Event): void;
	__endDrag(opts?: {
		component?: Component;
	}): void;
	__getFrameViews(): FrameView[];
	__behaviour(opts?: {}): {};
	__getBehaviour(): Record<string, any>;
	startDrag(block: Block, ev?: Event): void;
	endDrag(cancel?: boolean): void;
	postRender(): void;
	/**
	 * Add new block.
	 * @param {String} id Block ID
	 * @param {[Block]} props Block properties
	 * @returns {[Block]} Added block
	 * @example
	 * blockManager.add('h1-block', {
	 *   label: 'Heading',
	 *   content: '<h1>Put your title here</h1>',
	 *   category: 'Basic',
	 *   attributes: {
	 *     title: 'Insert h1 block'
	 *   }
	 * });
	 */
	add(id: string, props: BlockProperties, opts?: {}): Block;
	/**
	 * Get the block by id.
	 * @param  {String} id Block id
	 * @returns {[Block]}
	 * @example
	 * const block = blockManager.get('h1-block');
	 * console.log(JSON.stringify(block));
	 * // {label: 'Heading', content: '<h1>Put your ...', ...}
	 */
	get(id: string): Block;
	/**
	 * Return all blocks.
	 * @returns {Collection<[Block]>}
	 * @example
	 * const blocks = blockManager.getAll();
	 * console.log(JSON.stringify(blocks));
	 * // [{label: 'Heading', content: '<h1>Put your ...'}, ...]
	 */
	getAll(): Blocks;
	/**
	 * Return the visible collection, which containes blocks actually rendered
	 * @returns {Collection<[Block]>}
	 */
	getAllVisible(): Blocks;
	/**
	 * Remove block.
	 * @param {String|[Block]} block Block or block ID
	 * @returns {[Block]} Removed block
	 * @example
	 * const removed = blockManager.remove('BLOCK_ID');
	 * // or by passing the Block
	 * const block = blockManager.get('BLOCK_ID');
	 * blockManager.remove(block);
	 */
	remove(block: string | Block, opts?: {}): any;
	/**
	 * Get all available categories.
	 * It's possible to add categories only within blocks via 'add()' method
	 * @return {Array|Collection}
	 */
	getCategories(): Categories;
	/**
	 * Return the Blocks container element
	 * @return {HTMLElement}
	 */
	getContainer(): HTMLElement | undefined;
	/**
	 * Returns currently dragging block.
	 * Updated when the drag starts and cleared once it's done.
	 * @returns {[Block]|undefined}
	 */
	getDragBlock(): Block | undefined;
	/**
	 * Get blocks by category.
	 * @example
	 * blockManager.getBlocksByCategory();
	 * // Returns an array of items of this type
	 * // > { category?: Category; items: Block[] }
	 *
	 * // NOTE: The item without category is the one containing blocks without category.
	 *
	 * // You can also get the same output format by passing your own array of Blocks
	 * const myFilteredBlocks: Block[] = [...];
	 * blockManager.getBlocksByCategorymyFilteredBlocks
	 */
	getBlocksByCategory(blocks?: Block[]): BlocksByCategory[];
	/**
	 * Render blocks
	 * @param  {Array} blocks Blocks to render, without the argument will render all global blocks
	 * @param  {Object} [opts={}] Options
	 * @param  {Boolean} [opts.external] Render blocks in a new container (HTMLElement will be returned)
	 * @param  {Boolean} [opts.ignoreCategories] Render blocks without categories
	 * @return {HTMLElement} Rendered element
	 * @example
	 * // Render all blocks (inside the global collection)
	 * blockManager.render();
	 *
	 * // Render new set of blocks
	 * const blocks = blockManager.getAll();
	 * const filtered = blocks.filter(block => block.get('category') == 'sections')
	 *
	 * blockManager.render(filtered);
	 * // Or a new set from an array
	 * blockManager.render([
	 *  {label: 'Label text', content: '<div>Content</div>'}
	 * ]);
	 *
	 * // Back to blocks from the global collection
	 * blockManager.render();
	 *
	 * // You can also render your blocks outside of the main block container
	 * const newBlocksEl = blockManager.render(filtered, { external: true });
	 * document.getElementById('some-id').appendChild(newBlocksEl);
	 */
	render(blocks?: Block[], opts?: {
		external?: boolean;
	}): HTMLElement | undefined;
	destroy(): void;
}
/**
 * @typedef State
 * @property {String} name State name, eg. `hover`, `nth-of-type(2n)`
 * @property {String} label State label, eg. `Hover`, `Even/Odd`
 */
export declare class State extends Model {
	defaults(): {
		name: string;
		label: string;
	};
	/**
	 * Get state name
	 * @returns {String}
	 */
	getName(): string;
	/**
	 * Get state label. If label was not provided, the name will be returned.
	 * @returns {String}
	 */
	getLabel(): string;
}
declare class ClassTagsView extends View<Selector> {
	template({ labelInfo, labelHead, iconSync, iconAdd, pfx, ppfx }: any): string;
	events(): {
		"change [data-states]": string;
		"click [data-add]": string;
		"focusout [data-input]": string;
		"keyup [data-input]": string;
		"click [data-sync-style]": string;
	};
	$input?: JQuery<HTMLElement>;
	$addBtn?: JQuery<HTMLElement>;
	$classes?: JQuery<HTMLElement>;
	$btnSyncEl?: JQuery<HTMLElement>;
	$states?: JQuery<HTMLElement>;
	$statesC?: JQuery<HTMLElement>;
	em: EditorModel;
	target: EditorModel;
	module: SelectorManager;
	pfx: string;
	ppfx: string;
	stateInputId: string;
	stateInputC: string;
	config: any;
	states: State[];
	constructor(o?: any);
	syncStyle(): void;
	/**
	 * Triggered when a tag is removed from collection
	 * @param {Object} model Removed model
	 * @private
	 */
	tagRemoved(model?: State): void;
	/**
	 * Add new model
	 * @param {Object} model
	 * @private
	 */
	addNew(model: State): void;
	/**
	 * Start tag creation
	 * @param {Object} e
	 * @private
	 */
	startNewTag(): void;
	/**
	 * End tag creation
	 * @param {Object} e
	 * @private
	 */
	endNewTag(): void;
	/**
	 * Checks what to do on keyup event
	 * @param  {Object} e
	 * @private
	 */
	onInputKeyUp(e: KeyboardEvent): void;
	checkStates(): void;
	/**
	 * Triggered when component is changed
	 * @param  {Object} e
	 * @public
	 */
	componentChanged({ targets }?: any): void;
	updateSelection(targets: Component | Component[]): Selector[];
	getCommonSelectors({ targets, opts }?: any): Selector[];
	_commonSelectors(...args: any): Selector[];
	checkSync(): void;
	getTarget(): Component | undefined;
	getTargets(): Component[];
	/**
	 * Update states visibility. Hides states in case there is no tags
	 * inside collection
	 * @private
	 */
	updateStateVis(targets?: Component[] | Component): void;
	__handleStateChange(): void;
	/**
	 * Update selector helper
	 * @return {this}
	 * @private
	 */
	updateSelector(targets?: Component[] | Component): void;
	__getName(target: Component): string;
	/**
	 * Triggered when the select with states is changed
	 * @param  {Object} e
	 * @private
	 */
	stateChanged(ev: any): void;
	/**
	 * Add new tag to collection, if possible, and to the component
	 * @param  {Object} e
	 * @private
	 */
	addNewTag(value: any): void;
	/**
	 * Add new object to collection
	 * @param   {Object} model  Model
	 * @param   {Object} fragmentEl   Fragment collection
	 * @return {Object} Object created
	 * @private
	 * */
	addToClasses(model: State, fragmentEl?: DocumentFragment): HTMLElement;
	/**
	 * Render the collection of classes
	 * @private
	 */
	renderClasses(): void;
	/**
	 * Return classes element
	 * @return {HTMLElement}
	 * @private
	 */
	getClasses(): JQuery<HTMLElement>;
	/**
	 * Return states element
	 * @return {HTMLElement}
	 * @private
	 */
	getStates(): JQuery<HTMLElement>;
	/**
	 * Return states container element
	 * @return {HTMLElement}
	 * @private
	 */
	getStatesC(): JQuery<HTMLElement>;
	renderStates(): void;
	render(): this;
}
export type SelectorEvent = "selector:add" | "selector:remove" | "selector:update" | "selector:state" | "selector";
declare const selectorEvents: {
	all: string;
	update: string;
	add: string;
	remove: string;
	removeBefore: string;
	state: string;
	custom: string;
};
export type SelectorStringObject = string | {
	name?: string;
	label?: string;
	type?: number;
};
declare class SelectorManager extends ItemManagerModule<SelectorManagerConfig & {
	pStylePrefix?: string;
}> {
	Selector: typeof Selector;
	Selectors: typeof Selectors;
	model: Model;
	states: Collection<State>;
	selectorTags?: ClassTagsView;
	selected: Selectors;
	all: Selectors;
	events: typeof selectorEvents;
	storageKey: string;
	__update: Debounced;
	__ctn?: HTMLElement;
	/**
	 * Get configuration object
	 * @name getConfig
	 * @function
	 * @return {Object}
	 */
	constructor(em: EditorModel);
	__trgCustom(opts?: any): void;
	getAll<T extends {
		array?: boolean;
	}>(opts?: T): T["array"] extends true ? Selector[] : Selectors;
	__customData(opts?: any): {
		states: State[];
		selected: Selector[];
		container: HTMLElement | undefined;
	};
	postRender(): void;
	select(value: StyleModuleParam<"select", 0>, opts?: StyleModuleParam<"select", 1>): this;
	addSelector(name: SelectorStringObject | Selector, opts?: {}, cOpts?: {}): Selector;
	getSelector(name: string, type?: number): Selector | undefined;
	/**
	 * Add a new selector to the collection if it does not already exist.
	 * You can pass selectors properties or string identifiers.
	 * @param {Object|String} props Selector properties or string identifiers, eg. `{ name: 'my-class', label: 'My class' }`, `.my-cls`
	 * @param {Object} [opts] Selector options
	 * @return {[Selector]}
	 * @example
	 * const selector = selectorManager.add({ name: 'my-class', label: 'My class' });
	 * console.log(selector.toString()) // `.my-class`
	 * // Same as
	 * const selector = selectorManager.add('.my-class');
	 * console.log(selector.toString()) // `.my-class`
	 * */
	add(props: SelectorStringObject, opts?: {}): Selector | Selector[];
	/**
	 * Add class selectors
	 * @param {Array|string} classes Array or string of classes
	 * @return {Array} Array of added selectors
	 * @private
	 * @example
	 * sm.addClass('class1');
	 * sm.addClass('class1 class2');
	 * sm.addClass(['class1', 'class2']);
	 * // -> [SelectorObject, ...]
	 */
	addClass(classes: string | string[]): Selector[];
	/**
	 * Get the selector by its name/type
	 * @param {String} name Selector name or string identifier
	 * @returns {[Selector]|null}
	 * @example
	 * const selector = selectorManager.get('.my-class');
	 * // Get Id
	 * const selectorId = selectorManager.get('#my-id');
	 * */
	get<T extends string | string[]>(name: T, type?: number): T extends string[] ? Selector[] : Selector | undefined;
	/**
	 * Remove Selector.
	 * @param {String|[Selector]} selector Selector instance or Selector string identifier
	 * @returns {[Selector]} Removed Selector
	 * @example
	 * const removed = selectorManager.remove('.myclass');
	 * // or by passing the Selector
	 * selectorManager.remove(selectorManager.get('.myclass'));
	 */
	remove(selector: string | Selector, opts?: RemoveOptions): any;
	/**
	 * Rename Selector.
	 * @param {[Selector]} selector Selector to update.
	 * @param {String} name New name for the selector.
	 * @returns {[Selector]} Selector containing the passed name.
	 * @example
	 * const selector = selectorManager.get('myclass');
	 * const result = selectorManager.rename(selector, 'myclass2');
	 * console.log(result === selector ? 'Selector updated' : 'Selector with this name exists already');
	 */
	rename(selector: Selector, name: string, opts?: SetOptions): Selector;
	/**
	 * Change the selector state
	 * @param {String} value State value
	 * @returns {this}
	 * @example
	 * selectorManager.setState('hover');
	 */
	setState(value: string): this;
	/**
	 * Get the current selector state value
	 * @returns {String}
	 */
	getState(): string;
	/**
	 * Get states
	 * @returns {Array<[State]>}
	 */
	getStates(): State[];
	/**
	 * Set a new collection of states
	 * @param {Array<Object>} states Array of new states
	 * @returns {Array<[State]>}
	 * @example
	 * const states = selectorManager.setStates([
	 *   { name: 'hover', label: 'Hover' },
	 *   { name: 'nth-of-type(2n)', label: 'Even/Odd' }
	 * ]);
	 */
	setStates(states: State[], opts?: any): State[];
	/**
	 * Get commonly selected selectors, based on all selected components.
	 * @returns {Array<[Selector]>}
	 * @example
	 * const selected = selectorManager.getSelected();
	 * console.log(selected.map(s => s.toString()))
	 */
	getSelected(): Selector[];
	/**
	 * Get selected selectors.
	 * @returns {Array<[Selector]>}
	 * @example
	 * const selected = selectorManager.getSelectedAll();
	 * console.log(selected.map(s => s.toString()))
	 */
	getSelectedAll(): Selector[];
	/**
	 * Add new selector to all selected components.
	 * @param {Object|String} props Selector properties or string identifiers, eg. `{ name: 'my-class', label: 'My class' }`, `.my-cls`
	 * @example
	 * selectorManager.addSelected('.new-class');
	 */
	addSelected(props: SelectorStringObject): void;
	/**
	 * Remove a common selector from all selected components.
	 * @param {String|[Selector]} selector Selector instance or Selector string identifier
	 * @example
	 * selectorManager.removeSelected('.myclass');
	 */
	removeSelected(selector: Selector): void;
	duplicateSelected(selector: Selector, opts?: {
		suffix?: string;
	}): void;
	/**
	 * Get the array of currently selected targets.
	 * @returns {Array<[Component]|[CssRule]>}
	 * @example
	 * const targetsToStyle = selectorManager.getSelectedTargets();
	 * console.log(targetsToStyle.map(target => target.getSelectorsString()))
	 */
	getSelectedTargets(): StyleableModel[];
	/**
	 * Update component-first option.
	 * If the component-first is enabled, all the style changes will be applied on selected components (ID rules) instead
	 * of selectors (which would change styles on all components with those classes).
	 * @param {Boolean} value
	 */
	setComponentFirst(value: boolean): void;
	/**
	 * Get the value of component-first option.
	 * @return {Boolean}
	 */
	getComponentFirst(): boolean;
	/**
	 * Get all selectors
	 * @name getAll
	 * @function
	 * @return {Collection<[Selector]>}
	 * */
	/**
	 * Return escaped selector name
	 * @param {String} name Selector name to escape
	 * @returns {String} Escaped name
	 * @private
	 */
	escapeName(name: string): string;
	/**
	 * Render class selectors. If an array of selectors is provided a new instance of the collection will be rendered
	 * @param {Array<Object>} selectors
	 * @return {HTMLElement}
	 * @private
	 */
	render(selectors: any[]): HTMLElement;
	destroy(): void;
	/**
	 * Get common selectors from the current selection.
	 * @return {Array<Selector>}
	 * @private
	 */
	__getCommon(): Selector[];
	__getCommonSelectors(components: Component[], opts?: {}): Selector[];
	__common(...args: any): Selector[];
	__updateSelectedByComponents(): void;
}
declare const ParserCss: (em?: EditorModel, config?: ParserConfig) => {
	/**
	 * Parse CSS string to a desired model object
	 * @param  {String} input CSS string
	 * @return {Array<Object>}
	 */
	parse(input: string): CssRuleJSON[];
	/**
	 * Check the returned node from a custom parser and transforms it to
	 * a valid object for the CSS composer
	 * @return {[type]}
	 */
	checkNode(node: CssRuleJSON | ParsedCssRule): CssRuleJSON[];
};
export type StringObject = Record<string, string>;
export type HTMLParseResult = {
	html: ComponentDefinitionDefined | ComponentDefinitionDefined[];
	css?: CssRuleJSON[];
};
declare const ParserHtml: (em?: EditorModel, config?: ParserConfig & {
	returnArray?: boolean;
}) => {
	compTypes: string;
	modelAttrStart: string;
	getPropAttribute(attrName: string, attrValue?: string): {
		name: string;
		value: any;
	};
	/**
	 * Extract component props from an attribute object
	 * @param {Object} attr
	 * @returns {Object} An object containing props and attributes without them
	 */
	splitPropsFromAttr(attr?: ObjectAny): {
		props: ObjectAny;
		attrs: StringObject;
	};
	/**
	 * Parse style string to object
	 * @param {string} str
	 * @return {Object}
	 * @example
	 * var stl = ParserHtml.parseStyle('color:black; width:100px; test:value;');
	 * console.log(stl);
	 * // {color: 'black', width: '100px', test: 'value'}
	 */
	parseStyle(str: string): Record<string, string | string[]>;
	/**
	 * Parse class string to array
	 * @param {string} str
	 * @return {Array<string>}
	 * @example
	 * var res = ParserHtml.parseClass('test1 test2 test3');
	 * console.log(res);
	 * // ['test1', 'test2', 'test3']
	 */
	parseClass(str: string): string[];
	/**
	 * Get data from the node element
	 * @param  {HTMLElement} el DOM element to traverse
	 * @return {Array<Object>}
	 */
	parseNode(el: HTMLElement, opts?: ObjectAny): ComponentDefinitionDefined[];
	/**
	 * Parse HTML string to a desired model object
	 * @param  {string} str HTML string
	 * @param  {ParserCss} parserCss In case there is style tags inside HTML
	 * @return {Object}
	 */
	parse(str: string, parserCss?: any, opts?: HTMLParserOptions): HTMLParseResult;
	__clearUnsafeAttr(node: HTMLElement): void;
};
declare class ParserModule extends Module<ParserConfig & {
	name?: string;
}> {
	parserHtml: ReturnType<typeof ParserHtml>;
	parserCss: ReturnType<typeof ParserCss>;
	constructor(em: EditorModel);
	/**
	 * Get configuration object
	 * @name getConfig
	 * @function
	 * @return {Object}
	 */
	/**
	 * Parse HTML string and return the object containing the Component Definition
	 * @param  {String} input HTML string to parse
	 * @param  {Object} [options] Options
	 * @param  {String} [options.htmlType] [HTML mime type](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString#Argument02) to parse
	 * @param  {Boolean} [options.allowScripts=false] Allow `<script>` tags
	 * @param  {Boolean} [options.allowUnsafeAttr=false] Allow unsafe HTML attributes (eg. `on*` inline event handlers)
	 * @returns {Object} Object containing the result `{ html: ..., css: ... }`
	 * @example
	 * const resHtml = Parser.parseHtml(`<table><div>Hi</div></table>`, {
	 *   htmlType: 'text/html', // default
	 * });
	 * // By using the `text/html`, this will fix automatically all the HTML syntax issues
	 * // Indeed the final representation, in this case, will be `<div>Hi</div><table></table>`
	 * const resXml = Parser.parseHtml(`<table><div>Hi</div></table>`, {
	 *   htmlType: 'application/xml',
	 * });
	 * // This will preserve the original format as, from the XML point of view, is a valid format
	 */
	parseHtml(input: string, options?: HTMLParserOptions): {
		html: ComponentDefinitionDefined | ComponentDefinitionDefined[];
		css?: CssRuleJSON[] | undefined;
	};
	/**
	 * Parse CSS string and return an array of valid definition objects for CSSRules
	 * @param  {String} input CSS string to parse
	 * @returns {Array<Object>} Array containing the result
	 * @example
	 * const res = Parser.parseCss('.cls { color: red }');
	 * // [{ ... }]
	 */
	parseCss(input: string): CssRuleJSON[];
	destroy(): void;
}
declare enum StorageEvents {
	/**
	 * @event `storage:start` Storage request start.
	 * @example
	 * editor.on('storage:start', (type) => {
	 *  console.log('Storage start');
	 * });
	 */
	start = "storage:start",
	/**
	 * @event `storage:start:store` Storage store request start.
	 * The project JSON object to store is passed as an argument (which you can edit).
	 * @example
	 * editor.on('storage:start:store', (data) => {
	 *  console.log('Storage start store');
	 * });
	 */
	startStore = "storage:start:store",
	/**
	 * @event `storage:start:load` Storage load request start.
	 * @example
	 * editor.on('storage:start:load', () => {
	 *  console.log('Storage start load');
	 * });
	 */
	startLoad = "storage:start:load",
	/**
	 * @event `storage:load` Storage loaded the project.
	 * The loaded project is passed as an argument.
	 * @example
	 * editor.on('storage:load', (data, res) => {
	 *  console.log('Storage loaded the project');
	 * });
	 */
	load = "storage:load",
	/**
	 * @event `storage:store` Storage stored the project.
	 * The stored project is passed as an argument.
	 * @example
	 * editor.on('storage:store', (data, res) => {
	 *  console.log('Storage stored the project');
	 * });
	 */
	store = "storage:store",
	/**
	 * @event `storage:after` Storage request completed.
	 * Triggered right after `storage:load`/`storage:store`.
	 * @example
	 * editor.on('storage:after', (type) => {
	 *  console.log('Storage request completed');
	 * });
	 */
	after = "storage:after",
	afterStore = "storage:after:store",
	afterLoad = "storage:after:load",
	/**
	 * @event `storage:end` Storage request ended.
	 * This event triggers also in case of errors.
	 * @example
	 * editor.on('storage:end', (type) => {
	 *  console.log('Storage request ended');
	 * });
	 */
	end = "storage:end",
	/**
	 * @event `storage:end:store` Storage store request ended.
	 * This event triggers also in case of errors.
	 * @example
	 * editor.on('storage:end:store', () => {
	 *  console.log('Storage store request ended');
	 * });
	 */
	endStore = "storage:end:store",
	/**
	 * @event `storage:end:load` Storage load request ended.
	 * This event triggers also in case of errors.
	 * @example
	 * editor.on('storage:end:load', () => {
	 *  console.log('Storage load request ended');
	 * });
	 */
	endLoad = "storage:end:load",
	/**
	 * @event `storage:error` Error on storage request.
	 * @example
	 * editor.on('storage:error', (err, type) => {
	 *  console.log('Storage error');
	 * });
	 */
	error = "storage:error",
	/**
	 * @event `storage:error:store` Error on store request.
	 * @example
	 * editor.on('storage:error:store', (err) => {
	 *  console.log('Error on store');
	 * });
	 */
	errorStore = "storage:error:store",
	/**
	 * @event `storage:error:load` Error on load request.
	 * @example
	 * editor.on('storage:error:load', (err) => {
	 *  console.log('Error on load');
	 * });
	 */
	errorLoad = "storage:error:load"
}
export type StorageEvent = `${StorageEvents}`;
export type StorageEventType = "store" | "load";
declare class StorageManager extends Module<StorageManagerConfig & {
	name?: string;
	_disable?: boolean;
	currentStorage?: string;
}> {
	storages: Record<string, IStorage>;
	events: typeof StorageEvents;
	constructor(em: EditorModel);
	/**
	 * Get configuration object
	 * @name getConfig
	 * @function
	 * @return {Object}
	 */
	/**
	 * Check if autosave is enabled.
	 * @returns {Boolean}
	 * */
	isAutosave(): boolean;
	/**
	 * Set autosave value.
	 * @param  {Boolean} value
	 * */
	setAutosave(value: boolean): this;
	/**
	 * Returns number of steps required before trigger autosave.
	 * @returns {Number}
	 * */
	getStepsBeforeSave(): number;
	/**
	 * Set steps required before trigger autosave.
	 * @param {Number} value
	 * */
	setStepsBeforeSave(value: number): this;
	/**
	 * Add new storage.
	 * @param {String} type Storage type
	 * @param {Object} storage Storage definition
	 * @param {Function} storage.load Load method
	 * @param  {Function} storage.store Store method
	 * @example
	 * storageManager.add('local2', {
	 *   async load(storageOptions) {
	 *     // ...
	 *   },
	 *   async store(data, storageOptions) {
	 *     // ...
	 *   },
	 * });
	 * */
	add<T extends StorageOptions>(type: string, storage: IStorage<T>): this;
	/**
	 * Return storage by type.
	 * @param {String} type Storage type
	 * @returns {Object|null}
	 * */
	get<T extends StorageOptions>(type: string): IStorage<T> | undefined;
	/**
	 * Get all storages.
	 * @returns {Object}
	 * */
	getStorages(): Record<string, IStorage<{}>>;
	/**
	 * Get current storage type.
	 * @returns {String}
	 * */
	getCurrent(): string;
	/**
	 * Set current storage type.
	 * @param {String} type Storage type
	 * */
	setCurrent(type: string): this;
	getCurrentStorage(): IStorage<StorageOptions> | undefined;
	/**
	 * Get storage options by type.
	 * @param {String} type Storage type
	 * @returns {Object}
	 * */
	getStorageOptions(type: string): StorageOptions;
	/**
	 * Store data in the current storage.
	 * @param {Object} data Project data.
	 * @param {Object} [options] Storage options.
	 * @returns {Object} Stored data.
	 * @example
	 * const data = editor.getProjectData();
	 * await storageManager.store(data);
	 * */
	store<T extends StorageOptions>(data: ProjectData, options?: T): Promise<ProjectData>;
	/**
	 * Load resource from the current storage by keys
	 * @param {Object} [options] Storage options.
	 * @returns {Object} Loaded data.
	 * @example
	 * const data = await storageManager.load();
	 * editor.loadProjectData(data);
	 * */
	load<T extends StorageOptions>(options?: T): Promise<ProjectData>;
	__askRecovery(): Promise<unknown>;
	getRecovery(): StorageManagerConfig["recovery"];
	getRecoveryStorage(): false | IStorage<StorageOptions> | undefined;
	__exec(storage: IStorage, opts: StorageOptions, data?: ProjectData): Promise<any>;
	__clearKeys(data?: ProjectData): ProjectData;
	getCurrentOptions(type?: string): StorageOptions;
	/**
	 * On start callback
	 * @private
	 */
	onStart(type: StorageEventType, data?: ProjectData): void;
	/**
	 * On after callback (before passing data to the callback)
	 * @private
	 */
	onAfter(type: StorageEventType, data: ProjectData, response: any): void;
	/**
	 * On end callback
	 * @private
	 */
	onEnd(type: StorageEventType, data: ProjectData, response?: any): void;
	/**
	 * On error callback
	 * @private
	 */
	onError(type: StorageEventType, error: any): void;
	/**
	 * Check if autoload is possible
	 * @return {Boolean}
	 * @private
	 * */
	canAutoload(): boolean;
	destroy(): void;
}
declare class ItemsView extends View {
	items: ItemView[];
	opt: any;
	config: any;
	parentView: ItemView;
	constructor(opt?: any);
	removeChildren(removed: Component): void;
	/**
	 * Add to collection
	 * @param Object Model
	 *
	 * @return Object
	 * */
	addTo(model: Component): void;
	/**
	 * Add new object to collection
	 * @param  Object  Model
	 * @param  Object   Fragment collection
	 * @param  integer  Index of append
	 *
	 * @return Object Object created
	 * */
	addToCollection(model: Component, fragmentEl: DocumentFragment | null, index?: number): any;
	remove(...args: [
	]): this;
	render(): this;
}
export type ItemViewProps = ViewOptions & {
	ItemView: ItemView;
	level: number;
	config: any;
	opened: {};
	model: Component;
	module: LayerManager;
	sorter: any;
	parentView: ItemView;
};
declare class ItemView extends View {
	events(): {
		"mousedown [data-toggle-move]": string;
		"touchstart [data-toggle-move]": string;
		"click [data-toggle-visible]": string;
		"click [data-toggle-open]": string;
		"click [data-toggle-select]": string;
		"mouseover [data-toggle-select]": string;
		"mouseout [data-toggle-select]": string;
		"dblclick [data-name]": string;
		"keydown [data-name]": string;
		"focusout [data-name]": string;
	};
	template(model: Component): string;
	get em(): EditorModel;
	get ppfx(): string;
	get pfx(): string;
	opt: ItemViewProps;
	module: LayerManager;
	config: any;
	sorter: any;
	/** @ts-ignore */
	model: Component;
	parentView: ItemView;
	items?: ItemsView;
	inputNameCls: string;
	clsTitleC: string;
	clsTitle: string;
	clsCaret: string;
	clsCount: string;
	clsMove: string;
	clsChildren: string;
	clsNoChild: string;
	clsEdit: string;
	clsNoEdit: string;
	_rendered?: boolean;
	caret?: JQuery<HTMLElement>;
	inputName?: HTMLElement;
	constructor(opt: ItemViewProps);
	initComponent(): void;
	updateName(): void;
	getVisibilityEl(): JQuery<HTMLElement>;
	updateVisibility(): void;
	/**
	 * Toggle visibility
	 * @param	Event
	 *
	 * @return 	void
	 * */
	toggleVisibility(ev?: MouseEvent): void;
	/**
	 * Handle the edit of the component name
	 */
	handleEdit(ev?: MouseEvent): void;
	handleEditKey(ev: KeyboardEvent): void;
	/**
	 * Handle with the end of editing of the component name
	 */
	handleEditEnd(ev?: KeyboardEvent): void;
	setName(name: string, { propName }: {
		propName: string;
		component?: Component;
	}): void;
	/**
	 * Get the input containing the name of the component
	 * @return {HTMLElement}
	 */
	getInputName(): HTMLElement;
	/**
	 * Update item opening
	 *
	 * @return void
	 * */
	updateOpening(): void;
	/**
	 * Toggle item opening
	 * @param {Object}	e
	 *
	 * @return void
	 * */
	toggleOpening(ev?: MouseEvent): void;
	/**
	 * Handle component selection
	 */
	handleSelect(event?: MouseEvent): void;
	/**
	 * Handle component selection
	 */
	handleHover(ev?: MouseEvent): void;
	handleHoverOut(ev?: MouseEvent): void;
	/**
	 * Delegate to sorter
	 * @param	Event
	 * */
	startSort(ev: MouseEvent): void;
	/**
	 * Update item on status change
	 * @param	Event
	 * */
	updateStatus(): void;
	getItemContainer(): JQuery<HTMLElement>;
	/**
	 * Update item aspect after children changes
	 *
	 * @return void
	 * */
	checkChildren(): void;
	getCaret(): JQuery<HTMLElement>;
	setRoot(cmp: Component | string): void;
	updateLayerable(): void;
	__clearItems(): void;
	remove(...args: [
	]): this;
	render(): this;
	__render(): void;
}
export interface LayerData {
	name: string;
	open: boolean;
	selected: boolean;
	hovered: boolean;
	visible: boolean;
	locked: boolean;
	components: Component[];
}
declare class LayerManager extends Module<LayerManagerConfig> {
	model: ModuleModel;
	__ctn?: HTMLElement;
	view?: View;
	events: {
		all: string;
		root: string;
		component: string;
		custom: string;
	};
	constructor(em: EditorModel);
	onLoad(): void;
	/**
	 * Update the root layer with another component.
	 * @param {[Component]|String} component Component to be set as root
	 * @return {[Component]}
	 * @example
	 * const component = editor.getSelected();
	 * layers.setRoot(component);
	 */
	setRoot(component: Component | string): Component;
	/**
	 * Get the current root layer.
	 * @return {[Component]}
	 * @example
	 * const layerRoot = layers.getRoot();
	 */
	getRoot(): Component;
	/**
	 * Get valid layer child components (eg. excludes non layerable components).
	 * @param {[Component]} component Component from which you want to get child components
	 * @returns {Array<[Component]>}
	 * @example
	 * const component = editor.getSelected();
	 * const components = layers.getComponents(component);
	 * console.log(components);
	 */
	getComponents(component: Component): Component[];
	/**
	 * Update the layer open state of the component.
	 * @param {[Component]} component Component to update
	 * @param {Boolean} value
	 */
	setOpen(component: Component, value: boolean): void;
	/**
	 * Check the layer open state of the component.
	 * @param {[Component]} component
	 * @returns {Boolean}
	 */
	isOpen(component: Component): boolean;
	/**
	 * Update the layer visibility state of the component.
	 * @param {[Component]} component Component to update
	 * @param {Boolean} value
	 */
	setVisible(component: Component, value: boolean): void;
	/**
	 * Check the layer visibility state of the component.
	 * @param {[Component]} component
	 * @returns {Boolean}
	 */
	isVisible(component: Component): boolean;
	/**
	 * Update the layer locked state of the component.
	 * @param {[Component]} component Component to update
	 * @param {Boolean} value
	 */
	setLocked(component: Component, value: boolean): void;
	/**
	 * Check the layer locked state of the component.
	 * @param {[Component]} component
	 * @returns {Boolean}
	 */
	isLocked(component: Component): boolean;
	/**
	 * Update the layer name of the component.
	 * @param {[Component]} component Component to update
	 * @param {String} value New name
	 */
	setName(component: Component, value: string): void;
	/**
	 * Get the layer name of the component.
	 * @param {[Component]} component
	 * @returns {String} Component layer name
	 */
	getName(component: Component): any;
	/**
	 * Get layer data from a component.
	 * @param {[Component]} component Component from which you want to read layer data.
	 * @returns {Object} Object containing the layer data.
	 * @example
	 * const component = editor.getSelected();
	 * const layerData = layers.getLayerData(component);
	 * console.log(layerData);
	 */
	getLayerData(component: Component): LayerData;
	setLayerData(component: Component, data: Partial<Omit<LayerData, "components">>, opts?: {}): void;
	/**
	 * Triggered when the selected component is changed
	 * @private
	 */
	componentChanged(sel?: Component, opts?: {}): void;
	getAll(): View | undefined;
	render(): HTMLElement;
	destroy(): void;
	__onRootChange(): void;
	__onComponent(component: Component): void;
	__isLayerable(cmp: Component): boolean;
	__trgCustom(opts?: any): void;
	updateLayer(component: Component, opts?: any): void;
}
/**
 * @property {String} type Asset type, eg. `'image'`.
 * @property {String} src Asset URL, eg. `'https://.../image.png'`.
 *
 * @module docsjs.Asset
 */
export declare class Asset extends Model {
	static getDefaults(): any;
	defaults(): {
		type: string;
		src: string;
	};
	/**
	 * Get asset type.
	 * @returns {String}
	 * @example
	 * // Asset: { src: 'https://.../image.png', type: 'image' }
	 * asset.getType(); // -> 'image'
	 * */
	getType(): any;
	/**
	 * Get asset URL.
	 * @returns {String}
	 * @example
	 * // Asset: { src: 'https://.../image.png'  }
	 * asset.getSrc(); // -> 'https://.../image.png'
	 * */
	getSrc(): any;
	/**
	 * Get filename of the asset (based on `src`).
	 * @returns {String}
	 * @example
	 * // Asset: { src: 'https://.../image.png' }
	 * asset.getFilename(); // -> 'image.png'
	 * // Asset: { src: 'https://.../image' }
	 * asset.getFilename(); // -> 'image'
	 * */
	getFilename(): any;
	/**
	 * Get extension of the asset (based on `src`).
	 * @returns {String}
	 * @example
	 * // Asset: { src: 'https://.../image.png' }
	 * asset.getExtension(); // -> 'png'
	 * // Asset: { src: 'https://.../image' }
	 * asset.getExtension(); // -> ''
	 * */
	getExtension(): any;
}
declare const TypeableCollectionExt: any;
export declare class Assets extends TypeableCollectionExt<Asset> {
}
declare class AssetsView extends View {
	options: any;
	config: AssetManagerConfig;
	pfx: string;
	ppfx: string;
	em: EditorModel;
	inputUrl?: HTMLInputElement | null;
	template({ pfx, ppfx, em }: AssetsView): string;
	constructor(o?: any);
	/**
	 * Add new asset to the collection via string
	 * @param {Event} e Event object
	 * @return {this}
	 * @private
	 */
	handleSubmit(ev: Event): void;
	/**
	 * Returns assets element
	 * @return {HTMLElement}
	 * @private
	 */
	getAssetsEl(): Element | null;
	/**
	 * Returns input url element
	 * @return {HTMLElement}
	 * @private
	 */
	getAddInput(): HTMLInputElement | null;
	/**
	 * Triggered when an asset is removed
	 * @param {Asset} model Removed asset
	 * @private
	 */
	removedAsset(model: Asset): void;
	/**
	 * Add asset to collection
	 * @private
	 * */
	addToAsset(model: Asset): void;
	/**
	 * Add new asset to collection
	 * @param Object Model
	 * @param Object Fragment collection
	 * @return Object Object created
	 * @private
	 * */
	addAsset(model: Asset, fragmentEl?: DocumentFragment | null): any;
	/**
	 * Checks if to show noAssets
	 * @param {Boolean} hide
	 * @private
	 */
	toggleNoAssets(hide?: boolean): void;
	/**
	 * Deselect all assets
	 * @private
	 * */
	deselectAll(): void;
	renderAssets(): void;
	render(): this;
}
export type FileUploaderTemplateProps = {
	pfx: string;
	title: string;
	uploadId: string;
	disabled: boolean;
	multiUpload: boolean;
};
declare class FileUploaderView extends View {
	options: any;
	config: AssetManagerConfig;
	pfx: string;
	ppfx: string;
	em: EditorModel;
	module: any;
	target: any;
	uploadId: string;
	disabled: boolean;
	multiUpload: boolean;
	uploadForm?: HTMLFormElement | null;
	template({ pfx, title, uploadId, disabled, multiUpload }: FileUploaderTemplateProps): string;
	events(): {
		"change [data-input]": string;
	};
	constructor(opts?: any);
	/**
	 * Triggered before the upload is started
	 * @private
	 */
	onUploadStart(): void;
	/**
	 * Triggered after the upload is ended
	 * @param  {Object|string} res End result
	 * @private
	 */
	onUploadEnd(res: any): void;
	/**
	 * Triggered on upload error
	 * @param  {Object} err Error
	 * @private
	 */
	onUploadError(err: Error): void;
	/**
	 * Triggered on upload response
	 * @param  {string} text Response text
	 * @private
	 */
	onUploadResponse(text: string, clb?: (json: any) => void): void;
	/**
	 * Upload files
	 * @param  {Object}  e Event
	 * @return {Promise}
	 * @private
	 * */
	uploadFile(e: DragEvent, clb?: () => void): any;
	/**
	 * Make input file droppable
	 * @private
	 * */
	initDrop(): void;
	initDropzone(ev: any): void;
	render(): this;
	static embedAsBase64(e: DragEvent, clb?: () => void): Promise<void> | undefined;
}
export type AssetEvent = "asset" | "asset:open" | "asset:close" | "asset:add" | "asset:remove" | "asset:update" | "asset:custom" | "asset:upload:start" | "asset:upload:end" | "asset:upload:error" | "asset:upload:response";
declare const assetEvents: {
	all: string;
	select: string;
	update: string;
	add: string;
	remove: string;
	removeBefore: string;
	custom: string;
	open: string;
	close: string;
	uploadStart: string;
	uploadEnd: string;
	uploadError: string;
	uploadResponse: string;
};
export type AssetProps = Record<string, any>;
export type OpenOptions = {
	select?: (asset: Asset, complete: boolean) => void;
	types?: string[];
	accept?: string;
	target?: any;
};
declare class AssetManager extends ItemManagerModule<AssetManagerConfig, Assets> {
	storageKey: string;
	Asset: typeof Asset;
	Assets: typeof Assets;
	assetsVis: Assets;
	am?: AssetsView;
	fu?: FileUploaderView;
	_bhv?: any;
	events: typeof assetEvents;
	/**
	 * Initialize module
	 * @param {Object} config Configurations
	 * @private
	 */
	constructor(em: EditorModel);
	__propEv(ev: string, ...data: any[]): void;
	__trgCustom(): void;
	__customData(): {
		am: AssetManager;
		open: boolean;
		assets: any;
		types: any;
		container: any;
		close: () => void;
		remove: (asset: string | Asset, opts?: Record<string, any>) => any;
		select: (asset: Asset, complete: boolean) => void;
		options: any;
	};
	/**
	 * Open the asset manager.
	 * @param {Object} [options] Options for the asset manager.
	 * @param {Array<String>} [options.types=['image']] Types of assets to show.
	 * @param {Function} [options.select] Type of operation to perform on asset selection. If not specified, nothing will happen.
	 * @example
	 * assetManager.open({
	 *  select(asset, complete) {
	 *    const selected = editor.getSelected();
	 *    if (selected && selected.is('image')) {
	 *      selected.addAttributes({ src: asset.getSrc() });
	 *      // The default AssetManager UI will trigger `select(asset, false)` on asset click
	 *      // and `select(asset, true)` on double-click
	 *      complete && assetManager.close();
	 *    }
	 *  }
	 * });
	 * // with your custom types (you should have assets with those types declared)
	 * assetManager.open({ types: ['doc'], ... });
	 */
	open(options?: OpenOptions): void;
	/**
	 * Close the asset manager.
	 * @example
	 * assetManager.close();
	 */
	close(): void;
	/**
	 * Checks if the asset manager is open
	 * @returns {Boolean}
	 * @example
	 * assetManager.isOpen(); // true | false
	 */
	isOpen(): boolean;
	/**
	 * Add new asset/s to the collection. URLs are supposed to be unique
	 * @param {String|Object|Array<String>|Array<Object>} asset URL strings or an objects representing the resource.
	 * @param {Object} [opts] Options
	 * @returns {[Asset]}
	 * @example
	 * // As strings
	 * assetManager.add('http://img.jpg');
	 * assetManager.add(['http://img.jpg', './path/to/img.png']);
	 *
	 * // Using objects you can indicate the type and other meta informations
	 * assetManager.add({
	 *  // type: 'image',	// image is default
	 * 	src: 'http://img.jpg',
	 * 	height: 300,
	 *	width: 200,
	 * });
	 * assetManager.add([{ src: 'img2.jpg' }, { src: 'img2.png' }]);
	 */
	add(asset: string | AssetProps | (string | AssetProps)[], opts?: Record<string, any>): any;
	/**
	 * Return asset by URL
	 * @param  {String} src URL of the asset
	 * @returns {[Asset]|null}
	 * @example
	 * const asset = assetManager.get('http://img.jpg');
	 */
	get(src: string): Asset | null;
	/**
	 * Return the global collection, containing all the assets
	 * @returns {Collection<[Asset]>}
	 */
	getAll(): Assets;
	/**
	 * Return the visible collection, which contains assets actually rendered
	 * @returns {Collection<[Asset]>}
	 */
	getAllVisible(): Assets;
	/**
	 * Remove asset
	 * @param {String|[Asset]} asset Asset or asset URL
	 * @returns {[Asset]} Removed asset
	 * @example
	 * const removed = assetManager.remove('http://img.jpg');
	 * // or by passing the Asset
	 * const asset = assetManager.get('http://img.jpg');
	 * assetManager.remove(asset);
	 */
	remove(asset: string | Asset, opts?: Record<string, any>): any;
	store(): any;
	load(data: Record<string, any>): any;
	/**
	 * Return the Asset Manager Container
	 * @returns {HTMLElement}
	 */
	getContainer(): any;
	/**
	 *  Get assets element container
	 * @returns {HTMLElement}
	 * @private
	 */
	getAssetsEl(): Element | null | undefined;
	/**
	 * Render assets
	 * @param  {array} assets Assets to render, without the argument will render all global assets
	 * @returns {HTMLElement}
	 * @private
	 * @example
	 * // Render all assets
	 * assetManager.render();
	 *
	 * // Render some of the assets
	 * const assets = assetManager.getAll();
	 * assetManager.render(assets.filter(
	 *  asset => asset.get('category') == 'cats'
	 * ));
	 */
	render(assts?: Asset[]): any;
	__viewParams(): {
		collection: Assets;
		globalCollection: Assets;
		config: AssetManagerConfig & {
			pStylePrefix?: string | undefined;
		};
		module: AssetManager;
		fu: any;
	};
	/**
	 * Add new type. If you want to get more about type definition we suggest to read the [module's page](/modules/Assets.html)
	 * @param {string} id Type ID
	 * @param {Object} definition Definition of the type. Each definition contains
	 *                            `model` (business logic), `view` (presentation logic)
	 *                            and `isType` function which recognize the type of the
	 *                            passed entity
	 * @private
	 * @example
	 * assetManager.addType('my-type', {
	 *  model: {},
	 *  view: {},
	 *  isType: (value) => {},
	 * })
	 */
	addType(id: string, definition: any): void;
	/**
	 * Get type
	 * @param {string} id Type ID
	 * @returns {Object} Type definition
	 * @private
	 */
	getType(id: string): any;
	/**
	 * Get types
	 * @returns {Array}
	 * @private
	 */
	getTypes(): any;
	AssetsView(): AssetsView | undefined;
	FileUploader(): FileUploaderView;
	onLoad(): void;
	postRender(editorView: any): void;
	/**
	 * Set new target
	 * @param	{Object}	m Model
	 * @private
	 * */
	setTarget(m: any): void;
	/**
	 * Set callback after asset was selected
	 * @param	{Object}	f Callback function
	 * @private
	 * */
	onSelect(f: any): void;
	/**
	 * Set callback to fire when the asset is clicked
	 * @param {function} func
	 * @private
	 */
	onClick(func: any): void;
	/**
	 * Set callback to fire when the asset is double clicked
	 * @param {function} func
	 * @private
	 */
	onDblClick(func: any): void;
	__behaviour(opts?: {}): any;
	__getBehaviour(opts?: {}): any;
	destroy(): void;
}
export declare class Devices extends Collection<Device> {
}
export interface DevicesViewConfig {
	em: EditorModel;
	pStylePrefix?: string;
}
declare class DevicesView extends View {
	em: EditorModel;
	config: DevicesViewConfig;
	ppfx: string;
	devicesEl?: JQuery<HTMLElement>;
	template({ ppfx, label }: {
		ppfx: string;
		label: string;
	}): string;
	events(): {
		change: string;
		"click [data-add-trasp]": string;
	};
	constructor(o: {
		config: DevicesViewConfig;
		collection: Devices;
	});
	/**
	 * Start adding new device
	 * @return {[type]} [description]
	 * @private
	 */
	startAdd(): void;
	/**
	 * Update device of the editor
	 * @private
	 */
	updateDevice(): void;
	/**
	 * Update select value on device update
	 * @private
	 */
	updateSelect(): void;
	/**
	 * Return devices options
	 * @return {string} String of options
	 * @private
	 */
	getOptions(): string;
	render(): this;
}
declare const deviceEvents: {
	all: string;
	select: string;
	update: string;
	add: string;
	remove: string;
	removeBefore: string;
};
declare class DeviceManager extends ItemManagerModule<DeviceManagerConfig & {
	appendTo?: HTMLElement | string;
}, Devices> {
	devices: Devices;
	events: typeof deviceEvents;
	view?: DevicesView;
	Device: typeof Device;
	Devices: typeof Devices;
	storageKey: string;
	constructor(em: EditorModel);
	_onSelect(m: EditorModel, deviceId: string, opts: Record<string, any>): void;
	/**
	 * Add new device
	 * @param {Object} props Device properties
	 * @returns {[Device]} Added device
	 * @example
	 * const device1 = deviceManager.add({
	 *  // Without an explicit ID, the `name` will be taken. In case of missing `name`, a random ID will be created.
	 *  id: 'tablet',
	 *  name: 'Tablet',
	 *  width: '900px', // This width will be applied on the canvas frame and for the CSS media
	 * });
	 * const device2 = deviceManager.add({
	 *  id: 'tablet2',
	 *  name: 'Tablet 2',
	 *  width: '800px', // This width will be applied on the canvas frame
	 *  widthMedia: '810px', // This width that will be used for the CSS media
	 *  height: '600px', // Height will be applied on the canvas frame
	 * });
	 */
	add(props: DeviceProperties, options?: Record<string, any>): Device;
	/**
	 * Return device by ID
	 * @param  {String} id ID of the device
	 * @returns {[Device]|null}
	 * @example
	 * const device = deviceManager.get('Tablet');
	 * console.log(JSON.stringify(device));
	 * // {name: 'Tablet', width: '900px'}
	 */
	get(id: string): Device | undefined;
	/**
	 * Remove device
	 * @param {String|[Device]} device Device or device id
	 * @returns {[Device]} Removed device
	 * @example
	 * const removed = deviceManager.remove('device-id');
	 * // or by passing the Device
	 * const device = deviceManager.get('device-id');
	 * deviceManager.remove(device);
	 */
	remove(device: string | Device, opts?: {}): any;
	/**
	 * Return all devices
	 * @returns {Array<[Device]>}
	 * @example
	 * const devices = deviceManager.getDevices();
	 * console.log(JSON.stringify(devices));
	 * // [{name: 'Desktop', width: ''}, ...]
	 */
	getDevices(): Device[];
	/**
	 * Change the selected device. This will update the frame in the canvas
	 * @param {String|[Device]} device Device or device id
	 * @example
	 * deviceManager.select('some-id');
	 * // or by passing the page
	 * const device = deviceManager.get('some-id');
	 * deviceManager.select(device);
	 */
	select(device: string | Device, opts?: {}): this;
	/**
	 * Get the selected device
	 * @returns {[Device]}
	 * @example
	 * const selected = deviceManager.getSelected();
	 */
	getSelected(): Device | undefined;
	getAll(): Devices;
	render(): HTMLElement;
	destroy(): void;
}
export declare class Pages extends Collection<Page> {
	constructor(models: any, em: EditorModel);
	onReset(m: Page, opts?: {
		previousModels?: Pages;
	}): void;
	onRemove(removed?: Page): void;
}
declare class PageManager extends ItemManagerModule<PageManagerConfig, Pages> {
	events: typeof PagesEvents;
	storageKey: string;
	get pages(): Pages;
	model: ModuleModel;
	getAll(): Page[];
	/**
	 * Get all pages
	 * @name getAll
	 * @function
	 * @returns {Array<[Page]>}
	 * @example
	 * const arrayOfPages = pageManager.getAll();
	 */
	/**
	 * Initialize module
	 * @hideconstructor
	 * @param {Object} config Configurations
	 */
	constructor(em: EditorModel);
	__onChange(event: string, page: Page, coll: Pages, opts?: any): void;
	onLoad(): void;
	_onPageChange(m: any, page: Page, opts: any): void;
	postLoad(): void;
	/**
	 * Add new page
	 * @param {Object} props Page properties
	 * @param {Object} [opts] Options
	 * @returns {[Page]}
	 * @example
	 * const newPage = pageManager.add({
	 *  id: 'new-page-id', // without an explicit ID, a random one will be created
	 *  styles: `.my-class { color: red }`, // or a JSON of styles
	 *  component: '<div class="my-class">My element</div>', // or a JSON of components
	 * });
	 */
	add(props: PageProperties, opts?: AddOptions & SelectableOption & AbortOption): Page | undefined;
	/**
	 * Remove page
	 * @param {String|[Page]} page Page or page id
	 * @returns {[Page]} Removed Page
	 * @example
	 * const removedPage = pageManager.remove('page-id');
	 * // or by passing the page
	 * const somePage = pageManager.get('page-id');
	 * pageManager.remove(somePage);
	 */
	remove(page: string | Page, opts?: RemoveOptions & AbortOption): false | Page | undefined;
	/**
	 * Get page by id
	 * @param {String} id Page id
	 * @returns {[Page]}
	 * @example
	 * const somePage = pageManager.get('page-id');
	 */
	get(id: string): Page | undefined;
	/**
	 * Get main page (the first one available)
	 * @returns {[Page]}
	 * @example
	 * const mainPage = pageManager.getMain();
	 */
	getMain(): Page;
	/**
	 * Get wrapper components (aka body) from all pages and frames.
	 * @returns {Array<[Component]>}
	 * @example
	 * const wrappers = pageManager.getAllWrappers();
	 * // Get all `image` components from the project
	 * const allImages = wrappers.map(wrp => wrp.findType('image')).flat();
	 */
	getAllWrappers(): ComponentWrapper[];
	/**
	 * Change the selected page. This will switch the page rendered in canvas
	 * @param {String|[Page]} page Page or page id
	 * @returns {this}
	 * @example
	 * pageManager.select('page-id');
	 * // or by passing the page
	 * const somePage = pageManager.get('page-id');
	 * pageManager.select(somePage);
	 */
	select(page: string | Page, opts?: SetOptions): this;
	/**
	 * Get the selected page
	 * @returns {[Page]}
	 * @example
	 * const selectedPage = pageManager.getSelected();
	 */
	getSelected(): Page | undefined;
	destroy(): void;
	store(): any;
	load(data: any): any;
	_createId(): string;
}
export type Messages = Required<I18nConfig>["messages"];
declare class I18nModule extends Module<I18nConfig & {
	stylePrefix?: string;
}> {
	/**
	 * Initialize module
	 * @param {Object} config Configurations
	 * @private
	 */
	constructor(em: EditorModel);
	/**
	 * Get configuration object
	 * @name getConfig
	 * @function
	 * @return {Object}
	 */
	/**
	 * Update current locale
	 * @param {String} locale Locale value
	 * @returns {this}
	 * @example
	 * i18n.setLocale('it');
	 */
	setLocale(locale: string): this;
	/**
	 * Get current locale
	 * @returns {String} Current locale value
	 */
	getLocale(): string | undefined;
	/**
	 * Get all messages
	 * @param {String} [lang] Specify the language of messages to return
	 * @param {Object} [opts] Options
	 * @param {Boolean} [opts.debug] Show warnings in case of missing language
	 * @returns {Object}
	 * @example
	 * i18n.getMessages();
	 * // -> { en: { hello: '...' }, ... }
	 * i18n.getMessages('en');
	 * // -> { hello: '...' }
	 */
	getMessages(lang: string, opts?: {}): any;
	/**
	 * Set new set of messages
	 * @param {Object} msg Set of messages
	 * @returns {this}
	 * @example
	 * i18n.getMessages();
	 * // -> { en: { msg1: 'Msg 1', msg2: 'Msg 2', } }
	 * i18n.setMessages({ en: { msg2: 'Msg 2 up', msg3: 'Msg 3', } });
	 * // Set replaced
	 * i18n.getMessages();
	 * // -> { en: { msg2: 'Msg 2 up', msg3: 'Msg 3', } }
	 */
	setMessages(msg: Messages): this;
	/**
	 * Update messages
	 * @param {Object} msg Set of messages to add
	 * @returns {this}
	 * @example
	 * i18n.getMessages();
	 * // -> { en: { msg1: 'Msg 1', msg2: 'Msg 2', } }
	 * i18n.addMessages({ en: { msg2: 'Msg 2 up', msg3: 'Msg 3', } });
	 * // Set updated
	 * i18n.getMessages();
	 * // -> { en: { msg1: 'Msg 1', msg2: 'Msg 2 up', msg3: 'Msg 3', } }
	 */
	addMessages(msg: Messages): this;
	/**
	 * Translate the locale message
	 * @param {String} key Label to translate
	 * @param {Object} [opts] Options for the translation
	 * @param {Object} [opts.params] Params for the translation
	 * @param {Boolean} [opts.debug] Show warnings in case of missing resources
	 * @returns {String}
	 * @example
	 * obj.setMessages({
	 *  en: { msg: 'Msg', msg2: 'Msg {test}'},
	 *  it: { msg2: 'Msg {test} it'},
	 * });
	 * obj.t('msg');
	 * // -> outputs `Msg`
	 * obj.t('msg2', { params: { test: 'hello' } });  // use params
	 * // -> outputs `Msg hello`
	 * obj.t('msg2', { l: 'it', params: { test: 'hello' } });  // custom local
	 * // -> outputs `Msg hello it`
	 */
	t(key: string, opts?: Record<string, any>): any;
	_localLang(): any;
	_addParams(str: string, params: Record<string, any>): string;
	_getMsg(key: string, locale: string, opts?: {}): any;
	_debug(str: string, opts?: {
		debug?: boolean;
	}): void;
	destroy(): void;
}
export type DropContent = BlockProperties["content"];
export interface Dim {
	top: number;
	left: number;
	height: number;
	width: number;
	offsets: ReturnType<CanvasModule["getElementOffsets"]>;
	dir?: boolean;
	el?: HTMLElement;
	indexEl?: number;
}
export interface Pos {
	index: number;
	indexEl: number;
	method: string;
}
export interface SorterOptions {
	borderOffset?: number;
	container?: HTMLElement;
	containerSel?: string;
	itemSel?: string;
	draggable?: boolean | string[];
	nested?: boolean;
	pfx?: string;
	ppfx?: string;
	freezeClass?: string;
	onStart?: Function;
	onEndMove?: Function;
	customTarget?: Function;
	onEnd?: Function;
	onMove?: Function;
	direction?: "v" | "h" | "a";
	relative?: boolean;
	ignoreViewChildren?: boolean;
	placer?: HTMLElement;
	document?: Document;
	wmargin?: number;
	offsetTop?: number;
	offsetLeft?: number;
	em?: EditorModel;
	canvasRelative?: boolean;
	avoidSelectOnEnd?: boolean;
	scale?: number;
}
declare class Sorter extends View {
	opt: SorterOptions;
	elT: number;
	elL: number;
	borderOffset: number;
	containerSel: string;
	itemSel: string;
	draggable: SorterOptions["draggable"];
	nested: boolean;
	pfx: string;
	ppfx?: string;
	freezeClass?: string;
	onStart: Function;
	onEndMove?: Function;
	customTarget?: Function;
	onEnd?: Function;
	onMoveClb?: Function;
	direction: "v" | "h" | "a";
	relative: boolean;
	ignoreViewChildren: boolean;
	plh?: HTMLElement;
	document: Document;
	wmargin: number;
	offTop: number;
	offLeft: number;
	dropContent?: DropContent;
	em?: EditorModel;
	dragHelper?: HTMLElement;
	canvasRelative: boolean;
	selectOnEnd: boolean;
	scale?: number;
	activeTextModel?: Model;
	dropModel?: Model;
	target?: HTMLElement;
	prevTarget?: HTMLElement;
	sourceEl?: HTMLElement;
	moved?: boolean;
	srcModel?: Model;
	targetModel?: Model;
	rX?: number;
	rY?: number;
	eventMove?: MouseEvent;
	prevTargetDim?: Dim;
	cacheDimsP?: Dim[];
	cacheDims?: Dim[];
	targetP?: HTMLElement;
	targetPrev?: HTMLElement;
	lastPos?: Pos;
	lastDims?: Dim[];
	$plh?: any;
	toMove?: Model | Model[];
	/** @ts-ignore */
	initialize(opt?: SorterOptions): void;
	getScale(): any;
	getContainerEl(elem?: HTMLElement): HTMLElement;
	getDocuments(el?: HTMLElement): Document[];
	/**
	 * Triggered when the offset of the editro is changed
	 */
	updateOffset(): void;
	/**
	 * Set content to drop
	 * @param {String|Object} content
	 */
	setDropContent(content: DropContent): void;
	updateTextViewCursorPosition(e: any): void;
	setContentEditable(model?: Model, mode?: boolean): void;
	/**
	 * Toggle cursor while sorting
	 * @param {Boolean} active
	 */
	toggleSortCursor(active?: boolean): void;
	/**
	 * Set drag helper
	 * @param {HTMLElement} el
	 * @param {Event} event
	 */
	setDragHelper(el: HTMLElement, event: Event): void;
	/**
	 * Update the position of the helper
	 * @param  {Event} e
	 */
	moveDragHelper(e: any): void;
	/**
	 * Returns true if the element matches with selector
	 * @param {Element} el
	 * @param {String} selector
	 * @return {Boolean}
	 */
	matches(el: HTMLElement, selector: string): any;
	/**
	 * Closest parent
	 * @param {Element} el
	 * @param {String} selector
	 * @return {Element|null}
	 */
	closest(el: HTMLElement, selector: string): HTMLElement | undefined;
	/**
	 * Get the offset of the element
	 * @param  {HTMLElement} el
	 * @return {Object}
	 */
	offset(el: HTMLElement): {
		top: number;
		left: number;
	};
	/**
	 * Create placeholder
	 * @return {HTMLElement}
	 */
	createPlaceholder(): HTMLDivElement;
	/**
	 * Picking component to move
	 * @param {HTMLElement} src
	 * */
	startSort(src?: HTMLElement, opts?: {
		container?: HTMLElement;
	}): void;
	/**
	 * Get the model from HTMLElement target
	 * @return {Model|null}
	 */
	getTargetModel(el: HTMLElement): any;
	/**
	 * Get the model of the current source element (element to drag)
	 * @return {Model}
	 */
	getSourceModel(source?: HTMLElement, { target, avoidChildren }?: any): Model;
	/**
	 * Highlight target
	 * @param  {Model|null} model
	 */
	selectTargetModel(model?: Model, source?: Model): void;
	/**
	 * During move
	 * @param {Event} e
	 * */
	onMove(e: MouseEvent): void;
	isTextableActive(src: any, trg: any): any;
	disableTextable(): void;
	/**
	 * Returns true if the elements is in flow, so is not in flow where
	 * for example the component is with float:left
	 * @param  {HTMLElement} el
	 * @param  {HTMLElement} parent
	 * @return {Boolean}
	 * @private
	 * */
	isInFlow(el: HTMLElement, parent?: HTMLElement): boolean;
	/**
	 * Check if el has style to be in flow
	 * @param  {HTMLElement} el
	 * @param  {HTMLElement} parent
	 * @return {Boolean}
	 * @private
	 */
	styleInFlow(el: HTMLElement, parent: HTMLElement): true | undefined;
	/**
	 * Check if the target is valid with the actual source
	 * @param  {HTMLElement} trg
	 * @return {Boolean}
	 */
	validTarget(trg: HTMLElement, src?: HTMLElement): {
		valid: boolean;
		src: HTMLElement | undefined;
		srcModel: Model<any, SetOptions, any>;
		trg: HTMLElement;
		trgModel: any;
		draggable: boolean;
		droppable: boolean;
		dragInfo: string;
		dropInfo: string;
	};
	/**
	 * Get dimensions of nodes relative to the coordinates
	 * @param  {HTMLElement} target
	 * @param {number} rX Relative X position
	 * @param {number} rY Relative Y position
	 * @return {Array<Array>}
	 */
	dimsFromTarget(target: HTMLElement, rX?: number, rY?: number): Dim[];
	/**
	 * Get valid target from element
	 * This method should replace dimsFromTarget()
	 * @param  {HTMLElement} el
	 * @return {HTMLElement}
	 */
	getTargetFromEl(el: HTMLElement): HTMLElement;
	/**
	 * Check if the current pointer is neare to element borders
	 * @return {Boolen}
	 */
	nearElBorders(el: HTMLElement): 1 | undefined;
	getCurrentPos(): {
		x: number;
		y: number;
	};
	/**
	 * Returns dimensions and positions about the element
	 * @param {HTMLElement} el
	 * @return {Array<number>}
	 */
	getDim(el: HTMLElement): Dim;
	/**
	 * Get children dimensions
	 * @param {HTMLELement} el Element root
	 * @return {Array}
	 * */
	getChildrenDim(trg: HTMLElement): Dim[];
	/**
	 * Check if the coordinates are near to the borders
	 * @param {Array<number>} dim
	 * @param {number} rX Relative X position
	 * @param {number} rY Relative Y position
	 * @return {Boolean}
	 * */
	nearBorders(dim: Dim, rX: number, rY: number): boolean;
	/**
	 * Find the position based on passed dimensions and coordinates
	 * @param {Array<Array>} dims Dimensions of nodes to parse
	 * @param {number} posX X coordindate
	 * @param {number} posY Y coordindate
	 * @return {Object}
	 * */
	findPosition(dims: Dim[], posX: number, posY: number): Pos;
	/**
	 * Updates the position of the placeholder
	 * @param {HTMLElement} phl
	 * @param {Array<Array>} dims
	 * @param {Object} pos Position object
	 * @param {Array<number>} trgDim target dimensions ([top, left, height, width])
	 * */
	movePlaceholder(plh: HTMLElement, dims: Dim[], pos: Pos, trgDim?: Dim): void;
	/**
	 * Build an array of all the parents, including the component itself
	 * @return {Model|null}
	 */
	parents(model: any): any[];
	/**
	 * Sort according to the position in the dom
	 * @param {Object} obj1 contains {model, parents}
	 * @param {Object} obj2 contains {model, parents}
	 */
	sort(obj1: any, obj2: any): number;
	/**
	 * Leave item
	 * @param event
	 *
	 * @return void
	 * */
	endMove(): void;
	/**
	 * Move component to new position
	 * @param {HTMLElement} dst Destination target
	 * @param {HTMLElement} src Element to move
	 * @param {Object} pos Object with position coordinates
	 * */
	move(dst: HTMLElement, src: HTMLElement | Model, pos: Pos): any;
	/**
	 * Rollback to previous situation
	 * @param {Event}
	 * @param {Bool} Indicates if rollback in anycase
	 * */
	rollback(e: any): void;
}
declare class UtilsModule extends Module {
	Sorter: typeof Sorter;
	Resizer: typeof Resizer;
	Dragger: typeof Dragger;
	helpers: {
		isBultInMethod: (key: string) => boolean;
		normalizeKey: (key: string) => string;
		wait: (mls?: number) => Promise<unknown>;
		isDef: (value: any) => boolean;
		hasWin: () => boolean;
		getGlobal: () => typeof globalThis;
		toLowerCase: (str: string) => string;
		getUiClass: (em: EditorModel, defCls: string) => string;
		find: (arr: any[], test: (item: any, i: number, arr: any[]) => boolean) => null;
		escape: (str?: string) => string;
		escapeNodeContent: (str?: string) => string;
		deepMerge: (...args: ObjectAny[]) => {
			[x: string]: any;
		};
		isComponent: (obj: any) => obj is Component;
		getComponentView: (el?: Node | undefined) => ComponentView<Component> | undefined;
		getComponentModel: (el?: Node | undefined) => Component | undefined;
		buildBase64UrlFromSvg: (svg: string) => string;
		hasDnd: (em: EditorModel) => boolean;
		upFirst: (value: string) => string;
		matches: any;
		getModel: (el: HTMLElement & {
			__cashData?: any;
		}, $?: any) => Component | undefined;
		camelCase: (value: string) => string;
		getElement: (el: HTMLElement) => any;
		shallowDiff: (objOrig: ObjectAny, objNew: ObjectAny) => ObjectAny;
		normalizeFloat: (value: any, step?: number, valueDef?: number) => any;
		getUnitFromValue: (value: any) => any;
		capitalize: (str?: string) => string;
		getViewEl: <T extends unknown>(el?: Node | undefined) => T | undefined;
		setViewEl: (el: any, view: any) => void;
		appendStyles: (styles: {}, opts?: {
			unique?: boolean | undefined;
			prepand?: boolean | undefined;
		}) => void;
		isObject: (val: any) => val is ObjectAny;
		isEmptyObj: (val: ObjectAny) => boolean;
		createId: (length?: number) => string;
		isRule: (obj: any) => any;
	};
	constructor(em: EditorModel);
	destroy(): void;
}
export interface Keymap {
	id: string;
	keys: string;
	handler: string | CommandFunction;
}
export interface KeymapOptions {
	/**
	 * Force the handler to be executed.
	 */
	force?: boolean;
	/**
	 * Prevent default of the original triggered event.
	 */
	prevent?: boolean;
}
export interface KeymapsConfig {
	/**
	 * Default keymaps.
	 */
	defaults?: Record<string, Omit<Keymap, "id"> & {
		opts?: KeymapOptions;
	}>;
}
export type KeymapEvent = "keymap:add" | "keymap:remove" | "keymap:emit" | `keymap:emit:${string}`;
declare class KeymapsModule extends Module<KeymapsConfig & {
	name?: string;
}> {
	keymaster: any;
	keymaps: Record<string, Keymap>;
	constructor(em: EditorModel);
	onLoad(): void;
	/**
	 * Get configuration object
	 * @name getConfig
	 * @function
	 * @return {Object}
	 */
	/**
	 * Add new keymap
	 * @param {string} id Keymap id
	 * @param {string} keys Keymap keys, eg. `ctrl+a`, `⌘+z, ctrl+z`
	 * @param {Function|string} handler Keymap handler, might be a function
	 * @param {Object} [opts={}] Options
	 * @param {Boolean} [opts.force=false] Force the handler to be executed.
	 * @param {Boolean} [opts.prevent=false] Prevent default of the original triggered event.
	 * @returns {Object} Added keymap
	 * @example
	 * // 'ns' is just a custom namespace
	 * keymaps.add('ns:my-keymap', '⌘+j, ⌘+u, ctrl+j, alt+u', editor => {
	 *  console.log('do stuff');
	 * });
	 * // or
	 * keymaps.add('ns:my-keymap', '⌘+s, ctrl+s', 'some-gjs-command', {
	 *  // Prevent the default browser action
	 *  prevent: true,
	 * });
	 *
	 * // listen to events
	 * editor.on('keymap:emit', (id, shortcut, event) => {
	 *  // ...
	 * })
	 */
	add(id: Keymap["id"], keys: Keymap["keys"], handler: Keymap["handler"], opts?: KeymapOptions): Keymap;
	/**
	 * Get the keymap by id
	 * @param {string} id Keymap id
	 * @return {Object} Keymap object
	 * @example
	 * keymaps.get('ns:my-keymap');
	 * // -> {keys, handler};
	 */
	get(id: string): Keymap;
	/**
	 * Get all keymaps
	 * @return {Object}
	 * @example
	 * keymaps.getAll();
	 * // -> {id1: {}, id2: {}};
	 */
	getAll(): Record<string, Keymap>;
	/**
	 * Remove the keymap by id
	 * @param {string} id Keymap id
	 * @return {Object} Removed keymap
	 * @example
	 * keymaps.remove('ns:my-keymap');
	 * // -> {keys, handler};
	 */
	remove(id: string): Keymap | undefined;
	/**
	 * Remove all binded keymaps
	 * @return {this}
	 */
	removeAll(): this;
	destroy(): void;
}
export declare class Modal extends ModuleModel<ModalModule> {
	defaults(): {
		title: string;
		content: string;
		attributes: {};
		open: boolean;
	};
	open(): void;
	close(): void;
}
declare class ModalView extends ModuleView<Modal> {
	template({ pfx, ppfx, content, title }: any): string;
	events(): {
		click: string;
		"click [data-close-modal]": string;
	};
	$title?: JQuery<HTMLElement>;
	$content?: JQuery<HTMLElement>;
	$collector?: JQuery<HTMLElement>;
	constructor(o: any);
	onClick(e: Event): void;
	/**
	 * Returns collector element
	 * @return {HTMLElement}
	 * @private
	 */
	getCollector(): JQuery<HTMLElement>;
	/**
	 * Returns content element
	 * @return {HTMLElement}
	 */
	getContent(): JQuery<HTMLElement>;
	/**
	 * Returns title element
	 * @return {HTMLElement}
	 * @private
	 */
	getTitle(opts?: any): HTMLElement | JQuery<HTMLElement> | undefined;
	/**
	 * Update content
	 * @private
	 * */
	updateContent(): void;
	/**
	 * Update title
	 * @private
	 * */
	updateTitle(): void;
	/**
	 * Update open
	 * @private
	 * */
	updateOpen(): void;
	/**
	 * Hide modal
	 * @private
	 * */
	hide(): void;
	/**
	 * Show modal
	 * @private
	 * */
	show(): void;
	updateAttr(attr?: any): void;
	render(): this;
}
export type ModalEvent = "modal:open" | "modal:close" | "modal";
declare class ModalModule extends Module<ModalConfig> {
	modal?: ModalView;
	/**
	 * Initialize module. Automatically called with a new instance of the editor
	 * @param {Object} config Configurations
	 * @private
	 */
	constructor(em: EditorModel);
	_evData(): {
		open: any;
		attributes: any;
		title: any;
		content: any;
		close: () => void;
	};
	postRender(view: EditorView): void;
	/**
	 * Open the modal window
	 * @param {Object} [opts={}] Options
	 * @param {String|HTMLElement} [opts.title] Title to set for the modal
	 * @param {String|HTMLElement} [opts.content] Content to set for the modal
	 * @param {Object} [opts.attributes] Updates the modal wrapper with custom attributes
	 * @returns {this}
	 * @example
	 * modal.open({
	 *   title: 'My title',
	 *   content: 'My content',
	 *   attributes: { class: 'my-class' },
	 * });
	 */
	open(opts?: any): this;
	/**
	 * Close the modal window
	 * @returns {this}
	 * @example
	 * modal.close();
	 */
	close(): this;
	/**
	 * Execute callback when the modal will be closed.
	 * The callback will be called one only time
	 * @param {Function} clb Callback to call
	 * @returns {this}
	 * @example
	 * modal.onceClose(() => {
	 *  console.log('The modal is closed');
	 * });
	 */
	onceClose(clb: EventHandler): this;
	/**
	 * Execute callback when the modal will be opened.
	 * The callback will be called one only time
	 * @param {Function} clb Callback to call
	 * @returns {this}
	 * @example
	 * modal.onceOpen(() => {
	 *  console.log('The modal is opened');
	 * });
	 */
	onceOpen(clb: EventHandler): this;
	/**
	 * Checks if the modal window is open
	 * @returns {Boolean}
	 * @example
	 * modal.isOpen(); // true | false
	 */
	isOpen(): boolean;
	/**
	 * Set the title to the modal window
	 * @param {string | HTMLElement} title Title
	 * @returns {this}
	 * @example
	 * // pass a string
	 * modal.setTitle('Some title');
	 * // or an HTMLElement
	 * const el = document.createElement('div');
	 * el.innerText =  'New title';
	 * modal.setTitle(el);
	 */
	setTitle(title: string): this;
	/**
	 * Returns the title of the modal window
	 * @returns {string | HTMLElement}
	 * @example
	 * modal.getTitle();
	 */
	getTitle(): any;
	/**
	 * Set the content of the modal window
	 * @param {string | HTMLElement} content Content
	 * @returns {this}
	 * @example
	 * // pass a string
	 * modal.setContent('Some content');
	 * // or an HTMLElement
	 * const el = document.createElement('div');
	 * el.innerText =  'New content';
	 * modal.setContent(el);
	 */
	setContent(content: string | HTMLElement): this;
	/**
	 * Get the content of the modal window
	 * @returns {string | HTMLElement}
	 * @example
	 * modal.getContent();
	 */
	getContent(): string | HTMLElement;
	/**
	 * Returns content element
	 * @return {HTMLElement}
	 * @private
	 */
	getContentEl(): HTMLElement | undefined;
	/**
	 * Returns modal model
	 * @return {Model}
	 * @private
	 */
	getModel(): any;
	/**
	 * Render the modal window
	 * @return {HTMLElement}
	 * @private
	 */
	render(): HTMLElement | undefined;
	destroy(): void;
}
declare class CodeEditorView extends View {
	pfx?: string;
	config: Record<string, any>;
	template({ pfx, codeName, label }: {
		pfx: string;
		codeName: string;
		label: string;
	}): string;
	initialize(o: any): void;
	render(): this;
}
declare class CodeManagerModule extends Module<CodeManagerConfig & {
	pStylePrefix?: string;
}> {
	defGenerators: Record<string, any>;
	defViewers: Record<string, any>;
	generators: Record<string, any>;
	viewers: Record<string, any>;
	EditorView: typeof CodeEditorView;
	constructor(em: EditorModel);
	/**
	 * Add new code generator to the collection
	 * @param  {string} id Code generator ID
	 * @param  {Object} generator Code generator wrapper
	 * @param {Function} generator.build Function that builds the code
	 * @return {this}
	 * @example
	 * codeManager.addGenerator('html7',{
	 *   build: function(model){
	 *    return 'myCode';
	 *   }
	 * });
	 * */
	addGenerator(id: string, generator: any): this;
	/**
	 * Get code generator by id
	 * @param  {string} id Code generator ID
	 * @return {Object|null}
	 * @example
	 * var generator = codeManager.getGenerator('html7');
	 * generator.build = function(model){
	 *   //extend
	 * };
	 * */
	getGenerator(id: string): any;
	/**
	 * Returns all code generators
	 * @return {Array<Object>}
	 * */
	getGenerators(): Record<string, any>;
	/**
	 * Add new code viewer
	 * @param  {string} id Code viewer ID
	 * @param  {Object} viewer Code viewer wrapper
	 * @param {Function} viewer.init Set element on which viewer will be displayed
	 * @param {Function} viewer.setContent Set content to the viewer
	 * @return {this}
	 * @example
	 * codeManager.addViewer('ace',{
	 *   init: function(el){
	 *     var ace = require('ace-editor');
	 *     this.editor  = ace.edit(el.id);
	 *   },
	 *   setContent: function(code){
	 *    this.editor.setValue(code);
	 *   }
	 * });
	 * */
	addViewer(id: string, viewer: any): this;
	/**
	 * Get code viewer by id
	 * @param  {string} id Code viewer ID
	 * @return {Object|null}
	 * @example
	 * var viewer = codeManager.getViewer('ace');
	 * */
	getViewer(id: string): any;
	/**
	 * Returns all code viewers
	 * @return {Array<Object>}
	 * */
	getViewers(): Record<string, any>;
	createViewer(opts?: any): any;
	/**
	 * Update code viewer content
	 * @param  {Object} viewer Viewer instance
	 * @param  {string} code  Code string
	 * @example
	 * var AceViewer = codeManager.getViewer('ace');
	 * // ...
	 * var viewer = AceViewer.init(el);
	 * // ...
	 * codeManager.updateViewer(AceViewer, 'code');
	 * */
	updateViewer(viewer: any, code: string): void;
	/**
	 * Get code from model
	 * @param  {Object} model Any kind of model that will be passed to the build method of generator
	 * @param  {string} genId Code generator id
	 * @param  {Object} [opt] Options
	 * @return {string}
	 * @example
	 * var codeStr = codeManager.getCode(model, 'html');
	 * */
	getCode(model: any, genId: string, opt?: any): string;
	/**
	 * Load default code generators
	 * @return {this}
	 * @private
	 * */
	loadDefaultGenerators(): this;
	/**
	 * Load default code viewers
	 * @return {this}
	 * @private
	 * */
	loadDefaultViewers(): this;
	destroy(): void;
}
export interface UndoGroup {
	index: number;
	actions: any[];
	labels: string[];
}
declare class UndoManagerModule extends Module<UndoManagerConfig & {
	name?: string;
	_disable?: boolean;
}> {
	beforeCache?: any;
	um: any;
	constructor(em: EditorModel);
	postLoad(): void;
	/**
	 * Get configuration object
	 * @name getConfig
	 * @function
	 * @return {Object}
	 */
	/**
	 * Add an entity (Model/Collection) to track
	 * Note: New Components and CSSRules will be added automatically
	 * @param {Model|Collection} entity Entity to track
	 * @return {this}
	 * @example
	 * um.add(someModelOrCollection);
	 */
	add(entity: any): this;
	/**
	 * Remove and stop tracking the entity (Model/Collection)
	 * @param {Model|Collection} entity Entity to remove
	 * @return {this}
	 * @example
	 * um.remove(someModelOrCollection);
	 */
	remove(entity: any): this;
	/**
	 * Remove all entities
	 * @return {this}
	 * @example
	 * um.removeAll();
	 */
	removeAll(): this;
	/**
	 * Start/resume tracking changes
	 * @return {this}
	 * @example
	 * um.start();
	 */
	start(): this;
	/**
	 * Stop tracking changes
	 * @return {this}
	 * @example
	 * um.stop();
	 */
	stop(): this;
	/**
	 * Undo last change
	 * @return {this}
	 * @example
	 * um.undo();
	 */
	undo(all?: boolean): this;
	/**
	 * Undo all changes
	 * @return {this}
	 * @example
	 * um.undoAll();
	 */
	undoAll(): this;
	/**
	 * Redo last change
	 * @return {this}
	 * @example
	 * um.redo();
	 */
	redo(all?: boolean): this;
	/**
	 * Redo all changes
	 * @return {this}
	 * @example
	 * um.redoAll();
	 */
	redoAll(): this;
	/**
	 * Checks if exists an available undo
	 * @return {Boolean}
	 * @example
	 * um.hasUndo();
	 */
	hasUndo(): boolean;
	/**
	 * Checks if exists an available redo
	 * @return {Boolean}
	 * @example
	 * um.hasRedo();
	 */
	hasRedo(): boolean;
	/**
	 * Check if the entity (Model/Collection) to tracked
	 * Note: New Components and CSSRules will be added automatically
	 * @param {Model|Collection} entity Entity to track
	 * @returns {Boolean}
	 */
	isRegistered(obj: any): boolean;
	/**
	 * Get stack of changes
	 * @return {Collection}
	 * @example
	 * const stack = um.getStack();
	 * stack.each(item => ...);
	 */
	getStack(): any[];
	/**
	 * Get grouped undo manager stack.
	 * The difference between `getStack` is when you do multiple operations at a time,
	 * like appending multiple components:
	 * `editor.getWrapper().append('<div>C1</div><div>C2</div>');`
	 * `getStack` will return a collection length of 2.
	 *  `getStackGroup` instead will group them as a single operation (the first
	 * inserted component will be returned in the list) by returning an array length of 1.
	 * @return {Array}
	 * @private
	 */
	getStackGroup(): any;
	skip(clb: Function): void;
	getGroupedStack(): UndoGroup[];
	goToGroup(group: UndoGroup): void;
	getPointer(): number;
	/**
	 * Clear the stack
	 * @return {this}
	 * @example
	 * um.clear();
	 */
	clear(): this;
	getInstance(): any;
	destroy(): void;
}
export type CommandEvent = "run" | "stop" | `run:${string}` | `stop:${string}` | `abort:${string}`;
declare class CommandsModule extends Module<CommandsConfig & {
	pStylePrefix?: string;
}> {
	CommandAbstract: typeof CommandAbstract;
	defaultCommands: Record<string, Command>;
	commands: Record<string, CommandObject>;
	active: Record<string, any>;
	/**
	 * @private
	 */
	constructor(em: Editor);
	/**
	 * Add new command to the collection
	 * @param	{string} id Command's ID
	 * @param	{Object|Function} command Object representing your command,
	 *  By passing just a function it's intended as a stateless command
	 *  (just like passing an object with only `run` method).
	 * @return {this}
	 * @example
	 * commands.add('myCommand', {
	 * 	run(editor, sender) {
	 * 		alert('Hello world!');
	 * 	},
	 * 	stop(editor, sender) {
	 * 	},
	 * });
	 * // As a function
	 * commands.add('myCommand2', editor => { ... });
	 * */
	add<T extends ObjectAny = {}>(id: string, command: CommandFunction | CommandObject<any, T>): this;
	/**
	 * Get command by ID
	 * @param	{string}	id Command's ID
	 * @return {Object} Object representing the command
	 * @example
	 * var myCommand = commands.get('myCommand');
	 * myCommand.run();
	 * */
	get(id: string): CommandObject | undefined;
	/**
	 * Extend the command. The command to extend should be defined as an object
	 * @param	{string}	id Command's ID
	 * @param {Object} Object with the new command functions
	 * @returns {this}
	 * @example
	 * commands.extend('old-command', {
	 *  someInnerFunction() {
	 *  // ...
	 *  }
	 * });
	 * */
	extend(id: string, cmd?: CommandObject): this;
	/**
	 * Check if command exists
	 * @param	{string}	id Command's ID
	 * @return {Boolean}
	 * */
	has(id: string): boolean;
	/**
	 * Get an object containing all the commands
	 * @return {Object}
	 */
	getAll(): Record<string, CommandObject>;
	/**
	 * Execute the command
	 * @param {String} id Command ID
	 * @param {Object} [options={}] Options
	 * @return {*} The return is defined by the command
	 * @example
	 * commands.run('myCommand', { someOption: 1 });
	 */
	run(id: string, options?: CommandOptions): any;
	/**
	 * Stop the command
	 * @param {String} id Command ID
	 * @param {Object} [options={}] Options
	 * @return {*} The return is defined by the command
	 * @example
	 * commands.stop('myCommand', { someOption: 1 });
	 */
	stop(id: string, options?: CommandOptions): any;
	/**
	 * Check if the command is active. You activate commands with `run`
	 * and disable them with `stop`. If the command was created without `stop`
	 * method it can't be registered as active
	 * @param  {String}  id Command id
	 * @return {Boolean}
	 * @example
	 * const cId = 'some-command';
	 * commands.run(cId);
	 * commands.isActive(cId);
	 * // -> true
	 * commands.stop(cId);
	 * commands.isActive(cId);
	 * // -> false
	 */
	isActive(id: string): boolean;
	/**
	 * Get all active commands
	 * @return {Object}
	 * @example
	 * console.log(commands.getActive());
	 * // -> { someCommand: itsLastReturn, anotherOne: ... };
	 */
	getActive(): Record<string, any>;
	/**
	 * Run command via its object
	 * @param  {Object} command
	 * @param {Object} options
	 * @return {*} Result of the command
	 * @private
	 */
	runCommand(command?: CommandObject, options?: CommandOptions): any;
	/**
	 * Stop the command
	 * @param  {Object} command
	 * @param {Object} options
	 * @return {*} Result of the command
	 * @private
	 */
	stopCommand(command?: CommandObject, options?: CommandOptions): any;
	/**
	 * Create anonymous Command instance
	 * @param {Object} command Command object
	 * @return {Command}
	 * @private
	 * */
	create(command: CommandObject): any;
	destroy(): void;
}
export interface EditorLoadOptions {
	/** Clear the editor state (eg. dirty counter, undo manager, etc.). */
	clear?: boolean;
}
declare class EditorModel extends Model {
	defaults(): {
		editing: number;
		selected: number;
		clipboard: null;
		dmode: number;
		componentHovered: null;
		previousModel: null;
		changesCount: number;
		storables: never[];
		modules: never[];
		toLoad: never[];
		opened: {};
		device: string;
	};
	__skip: boolean;
	defaultRunning: boolean;
	destroyed: boolean;
	_config: EditorConfig;
	_storageTimeout?: ReturnType<typeof setTimeout>;
	attrsOrig: any;
	timedInterval?: ReturnType<typeof setTimeout>;
	updateItr?: ReturnType<typeof setTimeout>;
	view?: EditorView;
	get storables(): IStorableModule[];
	get modules(): IModule[];
	get toLoad(): ILoadableModule[];
	get selected(): Selected;
	get shallow(): EditorModel;
	get I18n(): I18nModule;
	get Utils(): UtilsModule;
	get Commands(): CommandsModule;
	get Keymaps(): KeymapsModule;
	get Modal(): ModalModule;
	get Panels(): PanelManager;
	get CodeManager(): CodeManagerModule;
	get UndoManager(): UndoManagerModule;
	get RichTextEditor(): RichTextEditorModule;
	get Canvas(): CanvasModule;
	get Editor(): Editor;
	get Components(): ComponentManager;
	get Css(): CssComposer;
	get Blocks(): BlockManager;
	get Selectors(): SelectorManager;
	get Storage(): StorageManager;
	get Traits(): TraitManager;
	get Parser(): ParserModule;
	get Layers(): LayerManager;
	get Assets(): AssetManager;
	get Devices(): DeviceManager;
	get Pages(): PageManager;
	get Styles(): StyleManager;
	constructor(conf?: EditorConfig);
	_checkReady(): void;
	getContainer(): HTMLElement | undefined;
	listenLog(event: string): void;
	get config(): EditorConfig;
	/**
	 * Get configurations
	 * @param  {string} [prop] Property name
	 * @return {any} Returns the configuration object or
	 *  the value of the specified property
	 */
	getConfig<P extends EditorConfigKeys | undefined = undefined, R = P extends EditorConfigKeys ? EditorConfig[P] : EditorConfig>(prop?: P): R;
	/**
	 * Should be called once all modules and plugins are loaded
	 * @private
	 */
	loadOnStart(): void;
	/**
	 * Set the alert before unload in case it's requested
	 * and there are unsaved changes
	 * @private
	 */
	updateChanges(m: any, v: any, opts: ObjectAny): void;
	/**
	 * Load generic module
	 */
	private loadModule;
	private loadStorableModule;
	/**
	 * Initialize editor model and set editor instance
	 * @param {Editor} editor Editor instance
	 * @return {this}
	 * @public
	 */
	init(editor: Editor, opts?: {}): void;
	getEditor(): Editor;
	/**
	 * This method handles updates on the editor and tries to store them
	 * if requested and if the changesCount is exceeded
	 * @param  {Object} model
	 * @param  {any} val  Value
	 * @param  {Object} opt  Options
	 * @private
	 * */
	handleUpdates(model: any, val: any, opt?: any): void;
	changesUp(opts: any): void;
	/**
	 * Callback on component hover
	 * @param   {Object}   Model
	 * @param   {Mixed}   New value
	 * @param   {Object}   Options
	 * @private
	 * */
	componentHovered(editor: any, component: any, options: any): void;
	/**
	 * Returns model of the selected component
	 * @return {Component|null}
	 * @public
	 */
	getSelected(): Component | undefined;
	/**
	 * Returns an array of all selected components
	 * @return {Array}
	 * @public
	 */
	getSelectedAll(): Component[];
	/**
	 * Select a component
	 * @param  {Component} el Component to select
	 * @param  {Object} [opts={}] Options, optional
	 * @public
	 */
	setSelected(el?: Component | Component[], opts?: any): void;
	/**
	 * Add component to selection
	 * @param  {Component|Array<Component>} component Component to select
	 * @param  {Object} [opts={}] Options, optional
	 * @public
	 */
	addSelected(component: Component | Component[], opts?: any): void;
	/**
	 * Remove component from selection
	 * @param  {Component|Array<Component>} component Component to select
	 * @param  {Object} [opts={}] Options, optional
	 * @public
	 */
	removeSelected(component: Component | Component[], opts?: {}): void;
	/**
	 * Toggle component selection
	 * @param  {Component|Array<Component>} component Component to select
	 * @param  {Object} [opts={}] Options, optional
	 * @public
	 */
	toggleSelected(component: Component | Component[], opts?: any): void;
	/**
	 * Hover a component
	 * @param  {Component|Array<Component>} cmp Component to select
	 * @param  {Object} [opts={}] Options, optional
	 * @private
	 */
	setHovered(cmp?: Component | null, opts?: any): void;
	getHovered(): Component | undefined;
	/**
	 * Set components inside editor's canvas. This method overrides actual components
	 * @param {Object|string} components HTML string or components model
	 * @param {Object} opt the options object to be used by the [setComponents]{@link setComponents} method
	 * @return {this}
	 * @public
	 */
	setComponents(components: ComponentAdd, opt?: AddOptions): void;
	/**
	 * Returns components model from the editor's canvas
	 * @return {Components}
	 * @private
	 */
	getComponents(): string | undefined;
	/**
	 * Set style inside editor's canvas. This method overrides actual style
	 * @param {Object|string} style CSS string or style model
	 * @param {Object} opt the options object to be used by the `CssRules.add` method
	 * @return {this}
	 * @public
	 */
	setStyle(style: any, opt?: {}): this;
	/**
	 * Add styles to the editor
	 * @param {Array<Object>|Object|string} style CSS string or style model
	 * @returns {Array<CssRule>}
	 * @public
	 */
	addStyle(style: any, opts?: {}): CssRule[];
	/**
	 * Returns rules/style model from the editor's canvas
	 * @return {Rules}
	 * @private
	 */
	getStyle(): CssRules;
	/**
	 * Change the selector state
	 * @param {String} value State value
	 * @returns {this}
	 */
	setState(value: string): this;
	/**
	 * Get the current selector state
	 * @returns {String}
	 */
	getState(): string;
	/**
	 * Returns HTML built inside canvas
	 * @param {Object} [opts={}] Options
	 * @returns {string} HTML string
	 * @public
	 */
	getHtml(opts?: {
		component?: Component;
	} & HTMLGeneratorBuildOptions): string;
	/**
	 * Returns CSS built inside canvas
	 * @param {Object} [opts={}] Options
	 * @returns {string} CSS string
	 * @public
	 */
	getCss(opts?: {
		component?: Component;
		avoidProtected?: boolean;
	} & CssGeneratorBuildOptions): string | undefined;
	/**
	 * Returns JS of all components
	 * @return {string} JS string
	 * @public
	 */
	getJs(opts?: {
		component?: Component;
	}): string;
	/**
	 * Store data to the current storage.
	 * @public
	 */
	store<T extends StorageOptions>(options?: T): Promise<ProjectData>;
	/**
	 * Load data from the current storage.
	 * @public
	 */
	load<T extends StorageOptions>(options?: T, loadOptions?: EditorLoadOptions): Promise<ProjectData>;
	storeData(): ProjectData;
	loadData(data?: ProjectData): ProjectData;
	/**
	 * Returns device model by name
	 * @return {Device|null}
	 * @private
	 */
	getDeviceModel(): Device | undefined;
	/**
	 * Run default command if setted
	 * @param {Object} [opts={}] Options
	 * @private
	 */
	runDefault(opts?: {}): void;
	/**
	 * Stop default command
	 * @param {Object} [opts={}] Options
	 * @private
	 */
	stopDefault(opts?: {}): void;
	/**
	 * Update canvas dimensions and refresh data useful for tools positioning
	 * @public
	 */
	refreshCanvas(opts?: any): void;
	/**
	 * Clear all selected stuf inside the window, sometimes is useful to call before
	 * doing some dragging opearation
	 * @param {Window} win If not passed the current one will be used
	 * @private
	 */
	clearSelection(win?: Window): void;
	/**
	 * Get the current media text
	 * @return {string}
	 */
	getCurrentMedia(): string;
	/**
	 * Return the component wrapper
	 * @return {Component}
	 */
	getWrapper(): ComponentWrapper | undefined;
	setCurrentFrame(frameView?: FrameView): this;
	getCurrentFrame(): FrameView | undefined;
	getCurrentFrameModel(): Frame | undefined;
	getIcon(icon: string): any;
	/**
	 * Return the count of changes made to the content and not yet stored.
	 * This count resets at any `store()`
	 * @return {number}
	 */
	getDirtyCount(): number;
	clearDirtyCount(): this;
	getZoomDecimal(): number;
	getZoomMultiplier(): number;
	setDragMode(value: DragMode): this;
	getDragMode(component?: Component): DragMode;
	t(...args: any[]): any;
	/**
	 * Returns true if the editor is in absolute mode
	 * @returns {Boolean}
	 */
	inAbsoluteMode(component?: Component): boolean;
	/**
	 * Destroy editor
	 */
	destroyAll(): void;
	getEditing(): Component | undefined;
	setEditing(value: boolean | ComponentView): this;
	isEditing(): boolean;
	log(msg: string, opts?: any): void;
	logInfo(msg: string, opts?: any): void;
	logWarning(msg: string, opts?: any): void;
	logError(msg: string, opts?: any): void;
	initBaseColorPicker(el: any, opts?: {}): any;
	/**
	 * Execute actions without triggering the storage and undo manager.
	 * @param  {Function} clb
	 * @private
	 */
	skip(clb: Function): void;
	/**
	 * Set/get data from the HTMLElement
	 * @param  {HTMLElement} el
	 * @param  {string} name Data name
	 * @param  {any} value Date value
	 * @return {any}
	 * @private
	 */
	data(el: any, name: string, value: any): any;
}
export interface IModule<TConfig extends ModuleConfig = ModuleConfig> extends IBaseModule<TConfig> {
	destroy(): void;
	postLoad(key: any): any;
	onLoad?(): void;
	name: string;
	postRender?(view: any): void;
}
export interface IBaseModule<TConfig extends any> {
	em: EditorModel;
	config: TConfig;
}
export interface ModuleConfig {
	name?: string;
	stylePrefix?: string;
	appendTo?: string | HTMLElement;
}
export interface IStorableModule {
	storageKey: string[] | string;
	store(result: any): any;
	load(keys: ProjectData): void;
	clear(): void;
}
export interface ILoadableModule {
	onLoad(): void;
}
declare abstract class Module<T extends ModuleConfig = ModuleConfig> implements IModule<T> {
	private _em;
	private _config;
	private _name;
	debounced: Debounced[];
	collections: Collection[];
	cls: any[];
	state?: Model;
	events: any;
	model?: any;
	view?: any;
	constructor(em: EditorModel, moduleName: string, defaults?: T);
	get em(): EditorModel;
	get config(): T & {
		pStylePrefix?: string | undefined;
	};
	render(opts?: any): HTMLElement | JQuery<HTMLElement> | void;
	postLoad(key: any): void;
	get name(): string;
	getConfig<P extends keyof T | undefined = undefined, R = P extends keyof T ? T[P] : T>(name?: P): R & {
		pStylePrefix?: string;
	};
	__logWarn(str: string, opts?: {}): void;
	postRender?(view: any): void;
	destroy(): void;
	__destroy(): void;
	/**
	 * Move the main DOM element of the module.
	 * To execute only post editor render (in postRender)
	 */
	__appendTo(): void;
}
declare abstract class ItemManagerModule<TConf extends ModuleConfig = ModuleConfig, TCollection extends Collection = Collection> extends Module<TConf> {
	cls: any[];
	protected all: TCollection;
	view?: View;
	constructor(em: EditorModel, moduleName: string, all: any, events?: any, defaults?: TConf, opts?: {
		skipListen?: boolean;
	});
	private: boolean;
	abstract storageKey: string;
	abstract destroy(): void;
	postLoad(key: any): void;
	render(opts?: any): void;
	getProjectData(data?: any): any;
	loadProjectData(data?: any, param?: {
		all?: TCollection;
		onResult?: Function;
		reset?: boolean;
	}): any;
	clear(opts?: {}): this;
	getAll(): any;
	getAllMap(): {
		[key: string]: TCollection extends Collection<infer C> ? C : unknown;
	};
	__initListen(opts?: any): void;
	__remove(model: any, opts?: any): any;
	__catchAllEvent(event: any, model: any, coll: any, opts?: any): void;
	__appendTo(renderProps?: any): void;
	__onAllEvent(): void;
	_createId(len?: number): string;
	__listenAdd(model: TCollection, event: string): void;
	__listenRemove(model: TCollection, event: string): void;
	__listenUpdate(model: TCollection, event: string): void;
	__destroy(): void;
}
declare function html(literals: TemplateStringsArray, ...substs: string[]): string;
export type GeneralEvent = "canvasScroll" | "undo" | "redo" | "load" | "update";
export type EditorBuiltInEvents = ComponentEvent | BlockEvent | AssetEvent | KeymapEvent | StyleManagerEvent | StorageEvent | CanvasEvent | SelectorEvent | RichTextEditorEvent | ModalEvent | CommandEvent | GeneralEvent;
export type EditorEvent = LiteralUnion<EditorBuiltInEvents, string>;
export type EditorConfigType = EditorConfig & {
	pStylePrefix?: string;
};
export type EditorModelParam<T extends keyof EditorModel, N extends number> = Parameters<EditorModel[T]>[N];
export declare class Editor implements IBaseModule<EditorConfig> {
	editorView?: EditorView;
	editor: EditorModel;
	$: any;
	em: EditorModel;
	config: EditorConfigType;
	constructor(config?: EditorConfig, opts?: any);
	get Config(): EditorConfig;
	get I18n(): I18nModule;
	get Utils(): UtilsModule;
	get Commands(): CommandsModule;
	get Keymaps(): KeymapsModule;
	get Modal(): ModalModule;
	get Panels(): PanelManager;
	get Canvas(): CanvasModule;
	get Parser(): ParserModule;
	get CodeManager(): CodeManagerModule;
	get UndoManager(): UndoManagerModule;
	get RichTextEditor(): RichTextEditorModule;
	get Pages(): PageManager;
	get Components(): ComponentManager;
	get DomComponents(): ComponentManager;
	get Layers(): LayerManager;
	get LayerManager(): LayerManager;
	get Css(): CssComposer;
	get CssComposer(): CssComposer;
	get Storage(): StorageManager;
	get StorageManager(): StorageManager;
	get Assets(): AssetManager;
	get AssetManager(): AssetManager;
	get Blocks(): BlockManager;
	get BlockManager(): BlockManager;
	get Traits(): TraitManager;
	get TraitManager(): TraitManager;
	get Selectors(): SelectorManager;
	get SelectorManager(): SelectorManager;
	get Styles(): StyleManager;
	get StyleManager(): StyleManager;
	get Devices(): DeviceManager;
	get DeviceManager(): DeviceManager;
	get EditorModel(): EditorModel;
	/**
	 * Returns configuration object
	 * @returns {any} Returns the configuration object or the value of the specified property
	 */
	getConfig<P extends EditorConfigKeys | undefined = undefined, R = P extends EditorConfigKeys ? EditorConfig[P] : EditorConfig>(prop?: P): R;
	/**
	 * Returns HTML built inside canvas
	 * @param {Object} [opts={}] Options
	 * @param {Component} [opts.component] Return the HTML of a specific Component
	 * @param {Boolean} [opts.cleanId=false] Remove unnecessary IDs (eg. those created automatically)
	 * @returns {string} HTML string
	 */
	getHtml(opts?: EditorModelParam<"getHtml", 0>): string;
	/**
	 * Returns CSS built inside canvas
	 * @param {Object} [opts={}] Options
	 * @param {Component} [opts.component] Return the CSS of a specific Component
	 * @param {Boolean} [opts.json=false] Return an array of CssRules instead of the CSS string
	 * @param {Boolean} [opts.avoidProtected=false] Don't include protected CSS
	 * @param {Boolean} [opts.onlyMatched=false] Return only rules matched by the passed component.
	 * @param {Boolean} [opts.keepUnusedStyles=false] Force keep all defined rules. Toggle on in case output looks different inside/outside of the editor.
	 * @returns {String|Array<CssRule>} CSS string or array of CssRules
	 */
	getCss(opts?: EditorModelParam<"getCss", 0>): string | undefined;
	/**
	 * Returns JS of all components
	 * @param {Object} [opts={}] Options
	 * @param {Component} [opts.component] Get the JS of a specific component
	 * @returns {String} JS string
	 */
	getJs(opts?: EditorModelParam<"getJs", 0>): string;
	/**
	 * Return the complete tree of components. Use `getWrapper` to include also the wrapper
	 * @return {Components}
	 */
	getComponents(): Components;
	/**
	 * Return the wrapper and its all components
	 * @return {Component}
	 */
	getWrapper(): ComponentWrapper | undefined;
	/**
	 * Set components inside editor's canvas. This method overrides actual components
	 * @param {Array<Object>|Object|string} components HTML string or components model
	 * @param {Object} opt the options object to be used by the [setComponents]{@link em#setComponents} method
	 * @return {this}
	 * @example
	 * editor.setComponents('<div class="cls">New component</div>');
	 * // or
	 * editor.setComponents({
	 *  type: 'text',
	 *   classes:['cls'],
	 *   content: 'New component'
	 * });
	 */
	setComponents(components: ComponentAdd, opt?: AddOptions): this;
	/**
	 * Add components
	 * @param {Array<Object>|Object|string} components HTML string or components model
	 * @param {Object} opts Options
	 * @param {Boolean} [opts.avoidUpdateStyle=false] If the HTML string contains styles,
	 * by default, they will be created and, if already exist, updated. When this option
	 * is true, styles already created will not be updated.
	 * @return {Array<Component>}
	 * @example
	 * editor.addComponents('<div class="cls">New component</div>');
	 * // or
	 * editor.addComponents({
	 *  type: 'text',
	 *   classes:['cls'],
	 *   content: 'New component'
	 * });
	 */
	addComponents(components: ComponentAdd, opts?: AddOptions): Component[];
	/**
	 * Returns style in JSON format object
	 * @return {Object}
	 */
	getStyle(): CssRules;
	/**
	 * Set style inside editor's canvas. This method overrides actual style
	 * @param {Array<Object>|Object|string} style CSS string or style model
	 * @return {this}
	 * @example
	 * editor.setStyle('.cls{color: red}');
	 * //or
	 * editor.setStyle({
	 *   selectors: ['cls'],
	 *   style: { color: 'red' }
	 * });
	 */
	setStyle(style: any, opt?: any): this;
	/**
	 * Add styles to the editor
	 * @param {Array<Object>|Object|string} style CSS string or style model
	 * @returns {Array<CssRule>} Array of created CssRule instances
	 * @example
	 * editor.addStyle('.cls{color: red}');
	 */
	addStyle(style: any, opts?: {}): CssRule[];
	/**
	 * Returns the last selected component, if there is one
	 * @return {Model}
	 */
	getSelected(): Component | undefined;
	/**
	 * Returns an array of all selected components
	 * @return {Array}
	 */
	getSelectedAll(): Component[];
	/**
	 * Get a stylable entity from the selected component.
	 * If you select a component without classes the entity is the Component
	 * itself and all changes will go inside its 'style' attribute. Otherwise,
	 * if the selected component has one or more classes, the function will
	 * return the corresponding CSS Rule
	 * @return {Model}
	 */
	getSelectedToStyle(): any;
	/**
	 * Select a component
	 * @param  {Component|HTMLElement} el Component to select
	 * @param  {Object} [opts] Options
	 * @param  {Boolean} [opts.scroll] Scroll canvas to the selected element
	 * @return {this}
	 * @example
	 * // Select dropped block
	 * editor.on('block:drag:stop', function(model) {
	 *  editor.select(model);
	 * });
	 */
	select(el?: EditorModelParam<"setSelected", 0>, opts?: {
		scroll?: boolean;
	}): this;
	/**
	 * Add component to selection
	 * @param  {Component|HTMLElement|Array} el Component to select
	 * @return {this}
	 * @example
	 * editor.selectAdd(model);
	 */
	selectAdd(el: EditorModelParam<"addSelected", 0>): this;
	/**
	 * Remove component from selection
	 * @param  {Component|HTMLElement|Array} el Component to select
	 * @return {this}
	 * @example
	 * editor.selectRemove(model);
	 */
	selectRemove(el: EditorModelParam<"removeSelected", 0>): this;
	/**
	 * Toggle component selection
	 * @param  {Component|HTMLElement|Array} el Component to select
	 * @return {this}
	 * @example
	 * editor.selectToggle(model);
	 */
	selectToggle(el: EditorModelParam<"toggleSelected", 0>): this;
	/**
	 * Returns, if active, the Component enabled in rich text editing mode.
	 * @returns {Component|null}
	 * @example
	 * const textComp = editor.getEditing();
	 * if (textComp) {
	 *  console.log('HTML: ', textComp.toHTML());
	 * }
	 */
	getEditing(): Component | undefined;
	/**
	 * Set device to the editor. If the device exists it will
	 * change the canvas to the proper width
	 * @param {string} name Name of the device
	 * @return {this}
	 * @example
	 * editor.setDevice('Tablet');
	 */
	setDevice(name: string): this;
	/**
	 * Return the actual active device
	 * @return {string} Device name
	 * @example
	 * var device = editor.getDevice();
	 * console.log(device);
	 * // 'Tablet'
	 */
	getDevice(): string;
	/**
	 * Execute command
	 * @param {string} id Command ID
	 * @param {Object} options Custom options
	 * @return {*} The return is defined by the command
	 * @example
	 * editor.runCommand('myCommand', {someValue: 1});
	 */
	runCommand(id: string, options?: Record<string, unknown>): any;
	/**
	 * Stop the command if stop method was provided
	 * @param {string} id Command ID
	 * @param {Object} options Custom options
	 * @return {*} The return is defined by the command
	 * @example
	 * editor.stopCommand('myCommand', {someValue: 1});
	 */
	stopCommand(id: string, options?: Record<string, unknown>): any;
	/**
	 * Store data to the current storage.
	 * This will reset the counter of changes (`editor.getDirtyCount()`).
	 * @param {Object} [options] Storage options.
	 * @returns {Object} Stored data.
	 * @example
	 * const storedData = await editor.store();
	 */
	store<T extends StorageOptions>(options?: T): Promise<ProjectData>;
	/**
	 * Load data from the current storage.
	 * @param {Object} [options] Storage options.
	 * @param {Object} [loadOptions={}] Load options.
	 * @param {Boolean} [loadOptions.clear=false] Clear the editor state (eg. dirty counter, undo manager, etc.).
	 * @returns {Object} Loaded data.
	 * @example
	 * const data = await editor.load();
	 */
	load<T extends StorageOptions>(options?: T, loadOptions?: EditorLoadOptions): Promise<ProjectData>;
	/**
	 * Get the JSON project data, which could be stored and loaded back with `editor.loadProjectData(json)`
	 * @returns {Object}
	 * @example
	 * console.log(editor.getProjectData());
	 * // { pages: [...], styles: [...], ... }
	 */
	getProjectData(): ProjectData;
	/**
	 * Load data from the JSON project
	 * @param {Object} data Project to load
	 * @example
	 * editor.loadProjectData({ pages: [...], styles: [...], ... })
	 */
	loadProjectData(data: ProjectData): ProjectData;
	storeData(): ProjectData;
	loadData(data: any): ProjectData;
	/**
	 * Returns container element. The one which was indicated as 'container'
	 * on init method
	 * @return {HTMLElement}
	 */
	getContainer(): HTMLElement | undefined;
	/**
	 * Return the count of changes made to the content and not yet stored.
	 * This count resets at any `store()`
	 * @return {number}
	 */
	getDirtyCount(): number;
	/**
	 * Reset the counter of changes.
	 */
	clearDirtyCount(): EditorModel;
	/**
	 * Update editor dimension offsets
	 *
	 * This method could be useful when you update, for example, some position
	 * of the editor element (eg. canvas, panels, etc.) with CSS, where without
	 * refresh you'll get misleading position of tools
	 * @param {Object} [options] Options
	 * @param {Boolean} [options.tools=false] Update the position of tools (eg. rich text editor, component highlighter, etc.)
	 */
	refresh(opts?: {
		tools?: boolean;
	}): void;
	/**
	 * Replace the built-in Rich Text Editor with a custom one.
	 * @param {Object} obj Custom RTE Interface
	 * @example
	 * editor.setCustomRte({
	 *   // Function for enabling custom RTE
	 *   // el is the HTMLElement of the double clicked Text Component
	 *   // rte is the same instance you have returned the first time you call
	 *   // enable(). This is useful if need to check if the RTE is already enabled so
	 *   // ion this case you'll need to return the RTE and the end of the function
	 *   enable: function(el, rte) {
	 *     rte = new MyCustomRte(el, {}); // this depends on the Custom RTE API
	 *     ...
	 *     return rte; // return the RTE instance
	 *   }
	 *
	 *   // Disable the editor, called for example when you unfocus the Text Component
	 *  disable: function(el, rte) {
	 *     rte.blur(); // this depends on the Custom RTE API
	 *  }
	 *
	 * // Called when the Text Component is focused again. If you returned the RTE instance
	 * // from the enable function, the enable won't be called again instead will call focus,
	 * // in this case to avoid double binding of the editor
	 *  focus: function (el, rte) {
	 *   rte.focus(); // this depends on the Custom RTE API
	 *  }
	 * });
	 */
	setCustomRte<T>(obj: CustomRTE & ThisType<T & CustomRTE>): void;
	/**
	 * Replace the default CSS parser with a custom one.
	 * The parser function receives a CSS string as a parameter and expects
	 * an array of CSSRule objects as a result. If you need to remove the
	 * custom parser, pass `null` as the argument
	 * @param {Function|null} parser Parser function
	 * @return {this}
	 * @example
	 * editor.setCustomParserCss(css => {
	 *  const result = [];
	 *  // ... parse the CSS string
	 *  result.push({
	 *    selectors: '.someclass, div .otherclass',
	 *    style: { color: 'red' }
	 *  })
	 *  // ...
	 *  return result;
	 * });
	 */
	setCustomParserCss(parser: CustomParserCss): this;
	/**
	 * Change the global drag mode of components.
	 * To get more about this feature read: https://github.com/GrapesJS/grapesjs/issues/1936
	 * @param {String} value Drag mode, options: 'absolute' | 'translate'
	 * @returns {this}
	 */
	setDragMode(value: DragMode): this;
	/**
	 * Trigger event log message
	 * @param  {*} msg Message to log
	 * @param  {Object} [opts={}] Custom options
	 * @param  {String} [opts.ns=''] Namespace of the log (eg. to use in plugins)
	 * @param  {String} [opts.level='debug'] Level of the log, `debug`, `info`, `warning`, `error`
	 * @return {this}
	 * @example
	 * editor.log('Something done!', { ns: 'from-plugin-x', level: 'info' });
	 * // This will trigger following events
	 * // `log`, `log:info`, `log-from-plugin-x`, `log-from-plugin-x:info`
	 * // Callbacks of those events will always receive the message and
	 * // options, as arguments, eg:
	 * // editor.on('log:info', (msg, opts) => console.info(msg, opts))
	 */
	log(msg: string, opts?: {
		ns?: string;
		level?: string;
	}): this;
	/**
	 * Translate label
	 * @param {String} key Label to translate
	 * @param {Object} [opts] Options for the translation
	 * @param {Object} [opts.params] Params for the translation
	 * @param {Boolean} [opts.noWarn] Avoid warnings in case of missing resources
	 * @returns {String}
	 * @example
	 * editor.t('msg');
	 * // use params
	 * editor.t('msg2', { params: { test: 'hello' } });
	 * // custom local
	 * editor.t('msg2', { params: { test: 'hello' } l: 'it' });
	 */
	t(...args: any[]): any;
	/**
	 * Attach event
	 * @param  {string} event Event name
	 * @param  {Function} callback Callback function
	 * @return {this}
	 */
	on(event: EditorEvent, callback: EventHandler): this;
	/**
	 * Attach event and detach it after the first run
	 * @param  {string} event Event name
	 * @param  {Function} callback Callback function
	 * @return {this}
	 */
	once(event: EditorEvent, callback: EventHandler): this;
	/**
	 * Detach event
	 * @param  {string} event Event name
	 * @param  {Function} callback Callback function
	 * @return {this}
	 */
	off(event: EditorEvent, callback: EventHandler): this;
	/**
	 * Trigger event
	 * @param  {string} event Event to trigger
	 * @return {this}
	 */
	trigger(event: EditorEvent, ...args: any[]): this;
	/**
	 * Destroy the editor
	 */
	destroy(): void;
	/**
	 * Returns editor element
	 * @return {HTMLElement}
	 * @private
	 */
	getEl(): HTMLElement | undefined;
	/**
	 * Returns editor model
	 * @return {Model}
	 * @private
	 */
	getModel(): EditorModel;
	/**
	 * Render editor
	 * @return {HTMLElement}
	 */
	render(): HTMLElement;
	/**
	 * Trigger a callback once the editor is loaded and rendered.
	 * The callback will be executed immediately if the method is called on the already rendered editor.
	 * @param  {Function} clb Callback to trigger
	 * @example
	 * editor.onReady(() => {
	 *   // perform actions
	 * });
	 */
	onReady(clb: EventHandler): void;
	/**
	 * Print safe HTML by using ES6 tagged template strings.
	 * @param {Array<String>} literals
	 * @param  {Array<String>} substs
	 * @returns {String}
	 * @example
	 * const unsafeStr = '<script>....</script>';
	 * const safeStr = '<b>Hello</b>';
	 * // Use `$${var}` to avoid escaping
	 * const strHtml = editor.html`Escaped ${unsafeStr} unescaped $${safeStr}`;
	 */
	html: typeof html;
}
export declare class PropertyRadio extends PropertySelect {
	defaults(): any;
}
export declare class PropertySlider extends PropertyNumber {
	defaults(): any;
}
export declare const usePlugin: <P extends string | Plugin<any>>(plugin: P, opts?: (P extends Plugin<infer C extends {
	[x: string]: any;
}> ? C : {}) | undefined) => (editor: Editor) => void;
export declare const grapesjs: {
	$: any;
	editors: Editor[];
	plugins: PluginManager;
	usePlugin: <P extends string | Plugin<any>>(plugin: P, opts?: (P extends Plugin<infer C extends {
		[x: string]: any;
	}> ? C : {}) | undefined) => (editor: Editor) => void;
	version: any;
	/**
	 * Initialize the editor with passed options
	 * @param {Object} config Configuration object
	 * @param {string|HTMLElement} config.container Selector which indicates where render the editor
	 * @param {Boolean} [config.autorender=true] If true, auto-render the content
	 * @param {Array} [config.plugins=[]] Array of plugins to execute on start
	 * @param {Object} [config.pluginsOpts={}] Custom options for plugins
	 * @param {Boolean} [config.headless=false] Init headless editor
	 * @return {Editor} Editor instance
	 * @example
	 * var editor = grapesjs.init({
	 *   container: '#myeditor',
	 *   components: '<article class="hello">Hello world</article>',
	 *   style: '.hello{color: red}',
	 * })
	 */
	init(config?: EditorConfig): Editor;
};

export {
	CategoryProperties as BlockCategoryProperties,
	grapesjs as default,
};

export {};
