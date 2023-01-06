export interface StorageOptions {}

export interface ProjectData {}

export default interface IStorage<T extends StorageOptions = {}> {
  load: (options?: T) => Promise<ProjectData>;
  store: (data: ProjectData, options?: T) => Promise<any>;
  [key: string]: any;
}
