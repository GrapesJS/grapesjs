class RouteVariable {}

export default class RelativeRoute {
  constructor(path: string) {
    path.split('/').forEach(part => {});
    this.path = path;
  }

  // paths : string[]
  path: string;

  // private parseRouteVariable(pathChunk: string){
  //     pathChunk.match(/<.*>/)
  // }
}
