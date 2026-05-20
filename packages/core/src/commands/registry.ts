import type { ObjectAny } from '../common';
import type { CommandPublicOptions } from './registryHelpers';
import type CommandAbstract from './view/CommandAbstract';
import type {
  CommandConstructor,
  CommandFunction,
  CommandObject,
} from './view/CommandAbstract';
import type { FullscreenCommandRegistryRun, FullscreenCommandRegistryStop } from './view/Fullscreen';
import type { PreviewCommandRegistryRun, PreviewCommandRegistryStop } from './view/Preview';
import type { ResizeCommandRegistryRun, ResizeCommandRegistryStop } from './view/Resize';
import type { CopyComponentCommandRegistryRun } from './view/CopyComponent';
import type { PasteComponentCommandRegistryRun } from './view/PasteComponent';

type CommandRegistryHandler = (...args: any[]) => any;
type CommandRegistryEntry<TRegistry, TId extends string> = TId extends keyof TRegistry
  ? TRegistry[TId] extends CommandRegistryHandler
    ? TRegistry[TId]
    : CommandRegistryHandler
  : CommandRegistryHandler;

export interface CommandRegistryRun
  extends FullscreenCommandRegistryRun,
    PreviewCommandRegistryRun,
    ResizeCommandRegistryRun,
    CopyComponentCommandRegistryRun,
    PasteComponentCommandRegistryRun {}

export interface CommandRegistryStop
  extends FullscreenCommandRegistryStop,
    PreviewCommandRegistryStop,
    ResizeCommandRegistryStop {}

export type CommandRunKnownId = Extract<keyof CommandRegistryRun, string>;
export type CommandStopKnownId = Extract<keyof CommandRegistryStop, string>;
export type CommandKnownId = Extract<keyof CommandRegistryRun | keyof CommandRegistryStop, string>;

export type CommandRunPublicFn<TId extends string> = CommandRegistryEntry<CommandRegistryRun, TId>;
export type CommandStopPublicFn<TId extends string> = CommandRegistryEntry<CommandRegistryStop, TId>;

export type CommandRunArgs<TId extends string> = TId extends keyof CommandRegistryRun
  ? Parameters<CommandRunPublicFn<TId>>
  : [options?: any];
export type CommandStopArgs<TId extends string> = TId extends keyof CommandRegistryStop
  ? Parameters<CommandStopPublicFn<TId>>
  : [options?: any];

export type CommandRunOptions<TId extends string> = TId extends keyof CommandRegistryRun
  ? CommandPublicOptions<CommandRunPublicFn<TId>>
  : any;
export type CommandStopOptions<TId extends string> = TId extends keyof CommandRegistryStop
  ? CommandPublicOptions<CommandStopPublicFn<TId>>
  : any;

export type CommandRunResult<TId extends string> = TId extends keyof CommandRegistryRun
  ? ReturnType<CommandRunPublicFn<TId>>
  : any;
export type CommandStopResult<TId extends string> = TId extends keyof CommandRegistryStop
  ? ReturnType<CommandStopPublicFn<TId>>
  : any;

export type CommandFunctionById<TId extends string> = CommandFunction<CommandRunOptions<TId>, CommandRunResult<TId>>;
export type CommandObjectById<TId extends string, T extends ObjectAny = {}> = CommandObject<
  CommandRunOptions<TId>,
  T,
  CommandStopOptions<TId>,
  CommandRunResult<TId>,
  CommandStopResult<TId>
>;
export type CommandConstructorById<TId extends string> = CommandConstructor<
  CommandRunOptions<TId>,
  CommandStopOptions<TId>,
  CommandRunResult<TId>,
  CommandStopResult<TId>
>;
export type CommandDefinitionById<TId extends string, T extends ObjectAny = {}> =
  | CommandFunctionById<TId>
  | CommandObjectById<TId, T>
  | CommandConstructorById<TId>;
export type CommandInstanceById<TId extends string> = CommandAbstract<
  CommandRunOptions<TId>,
  CommandStopOptions<TId>,
  CommandRunResult<TId>,
  CommandStopResult<TId>
>;
