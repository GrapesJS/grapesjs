import { isFunction } from 'underscore';
import CanvasComponentNode from './CanvasComponentNode';
import { getSymbolMain, getSymbolTop, isSymbol, isSymbolMain } from '../../dom_components/model/SymbolUtils';
import Component from '../../dom_components/model/Component';
import { ContentElement, ContentType } from './types';
import { isComponent } from '../mixins';

type CanMoveSource = Component | ContentType;

export default class CanvasNewComponentNode extends CanvasComponentNode {
  /**
   * A cache of shallow editor models stored in the source node.
   * This is a map where each content item is associated with its corresponding shallow wrapper model.
   */
  private _cachedShallowModels: Map<ContentElement, Component> = new Map();

  /**
   * Ensures the shallow editor model for the given contentItem is cached in the source node.
   * If not cached, retrieves it from the shallow wrapper and stores it in the cache.
   * @param contentItem - The content item to retrieve or cache.
   * @returns {Component | null} - The shallow wrapper model, either cached or retrieved.
   */
  cacheSrcModelForContent(contentItem: ContentElement | Component): Component | undefined {
    if (isComponent(contentItem)) {
      return contentItem;
    }

    if (this._cachedShallowModels.has(contentItem)) {
      return this._cachedShallowModels.get(contentItem)!;
    }

    let srcModel;

    const wrapper = this.model.em.Components.getShallowWrapper();
    srcModel = wrapper?.append(contentItem)[0];

    if (srcModel) {
      this._cachedShallowModels.set(contentItem, srcModel);
    }

    return srcModel;
  }

  canMove(source: CanvasNewComponentNode, index: number): boolean {
    const realIndex = this.getRealIndex(index);
    const { model: symbolModel, content, dragDef } = source._dragSource;

    const canMoveSymbol = !symbolModel || !this.isSourceSameSymbol(symbolModel);
    const sourceContent: CanMoveSource = (isFunction(content) ? dragDef : content) || source.model;

    if (Array.isArray(sourceContent)) {
      return (
        sourceContent.every((contentItem, i) =>
          this.canMoveSingleContent(source.cacheSrcModelForContent(contentItem)!, realIndex + i),
        ) && canMoveSymbol
      );
    }

    return this.canMoveSingleContent(source.cacheSrcModelForContent(sourceContent)!, realIndex) && canMoveSymbol;
  }

  private canMoveSingleContent(contentItem: ContentElement | Component, index: number): boolean {
    return this.model.em.Components.canMove(this.model, contentItem, index).result;
  }

  addChildAt(node: CanvasNewComponentNode, index: number): CanvasNewComponentNode {
    const dragSource = node._dragSource;
    const dragSourceContent = dragSource.content!;
    const insertingTextableIntoText = this.isTextNode() && node.isTextable();
    const content = isFunction(dragSourceContent) ? dragSourceContent() : dragSourceContent;

    if (Array.isArray(content)) {
      return this.addMultipleChildren(content, index, insertingTextableIntoText);
    }

    return this.addSingleChild(content, index, insertingTextableIntoText);
  }

  /**
   * Adds a single content item to the current node.
   * The source node will first ensure that the model for the content is cached.
   * @param {ContentType} content - The content to add.
   * @param {number} index - The index where the content is to be added.
   * @param {boolean} insertingTextableIntoText - Whether the operation involves textable content.
   * @returns {CanvasNewComponentNode} - The newly added node.
   */
  private addSingleChild(
    content: ContentType,
    index: number,
    insertingTextableIntoText: boolean,
  ): CanvasNewComponentNode {
    let model;

    if (insertingTextableIntoText) {
      // @ts-ignore
      model = this.model?.getView?.()?.insertComponent?.(content, { action: 'add-component' });
    } else {
      model = this.model.components().add(content, { at: this.getRealIndex(index), action: 'add-component' });
    }
    return new (this.constructor as any)(model);
  }

  /**
   * Adds multiple content items as children, looping through the array.
   * @param {any[]} contentArray - Array of content items
   * @param {number} index - Index to start adding children
   * @param {boolean} insertingTextableIntoText - Whether inserting textable content
   * @returns {CanvasNewComponentNode} The last added node
   */
  private addMultipleChildren(
    contentArray: ContentType[],
    index: number,
    insertingTextableIntoText: boolean,
  ): CanvasNewComponentNode {
    let lastNode: CanvasNewComponentNode | undefined;
    contentArray.forEach((contentItem, i) => {
      lastNode = this.addSingleChild(contentItem, index + i, insertingTextableIntoText);
    });
    return lastNode!;
  }

  /**
   * Checks if the source component belongs to the same symbol model as the current component.
   * @param {Component | undefined} symbolModel - Symbol model to compare
   * @returns {boolean} Whether the source is the same symbol
   */
  private isSourceSameSymbol(symbolModel: Component | undefined) {
    if (isSymbol(this.model)) {
      const targetRootSymbol = getSymbolTop(this.model);
      const targetMainSymbol = isSymbolMain(targetRootSymbol) ? targetRootSymbol : getSymbolMain(targetRootSymbol);

      if (targetMainSymbol === symbolModel) {
        return true;
      }
    }
    return false;
  }

  set content(content: ContentType | (() => ContentType)) {
    this._dragSource.content = content;
  }
}
