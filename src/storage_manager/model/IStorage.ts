export interface StorageOptions {
  [key: string]: any;
}

export interface ProjectData {
  [key: string]: any;
}

export default interface IStorage<T extends StorageOptions = {}> {
  load: (options: T) => Promise<ProjectData>;
  store: (data: ProjectData, options: T) => Promise<any>;
  [key: string]: any;
}
