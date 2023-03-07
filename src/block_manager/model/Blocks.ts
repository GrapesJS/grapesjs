import { Collection } from '../../common';
import Block from './Block';

export default class Blocks extends Collection<Block> {}

Blocks.prototype.model = Block;
