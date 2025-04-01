import { addRoute, createRouter, findRoute } from "rou3";
import { RouteModuleInfo, Tree } from "src/unplugin/generators";
import { Import } from "unimport";

export class RouteTree {
  private tree = createRouter<TreeRoute>();
  private _tree: Tree["children"];
  constructor(tree: Tree["children"]) {
    // traverse tree and create Route objects
    const traverse = (tree: Tree["children"], parentId?: string) => {
      const routes: TreeRoute[] = [];
      for (const file in tree) {
        const { moduleInfo, children, filePath, isLeaf, path } = tree[file]!;
        const route = new TreeRoute(
          path,
          parentId,
          filePath,
          isLeaf,
          moduleInfo,
          children ? traverse(children, path) : undefined
        );
        addRoute(this.tree, "", filePath, route);
        routes.push(route);
      }
      return routes;
    };
    traverse(tree);
    this._tree = tree;
  }
  public findRootRoutes() {
    const rootRoutesKeys = Object.keys(this._tree);
    return rootRoutesKeys.map((key) => this.getRoute(key));
  }
  public getRoute(id: string) {
    return findRoute(this.tree, "", id)?.data;
  }
}

export class TreeRoute {
  public extraMiddlewares: Import[];
  constructor(
    public path: string,
    public parentId: string | undefined,
    public filePath: string,
    public isLeaf: boolean,
    public moduleInfo: RouteModuleInfo,
    public children?: TreeRoute[]
  ) {
    this.extraMiddlewares = [];
  }
  public addMiddleware(unImport: Import) {
    this.extraMiddlewares.push(unImport);
  }
  public addChildRoute(filePath: string) {}
}
