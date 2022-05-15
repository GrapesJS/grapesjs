export default interface IStorage {
  load(): any;
  store(data: any): void;
}
