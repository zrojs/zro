import { addRoute, createRouter, findRoute } from "rou3";
import { getModuleInfo, RouteModuleInfo, Tree } from "src/unplugin/generators";
import { Import } from "unimport";

export class RouteTree {
  private tree = createRouter<TreeRoute>();
  private bootstrapScripts: { unImport: Import; configFileName?: string }[] =
    [];
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
  public addBootstrapScript(imp: Import, configFileName?: string) {
    this.bootstrapScripts.push({ unImport: imp, configFileName });
  }
  public getBootstrapScripts() {
    return this.bootstrapScripts;
  }
  public async addRootRoute(
    filePath: string,
    path: string,
    configFileName?: string
  ) {
    const moduleInfo = await getModuleInfo(filePath);
    const route = new TreeRoute(
      path,
      undefined,
      filePath,
      true,
      moduleInfo,
      [],
      configFileName
    );
    addRoute(this.tree, "", filePath, route);
    this._tree[filePath] = {
      children: {},
      filePath,
      isLeaf: true,
      moduleInfo,
      path,
    };
  }
}

export class TreeRoute {
  public extraMiddlewares: { unImport: Import; configFileName?: string }[];
  constructor(
    public path: string,
    public parentId: string | undefined,
    public filePath: string,
    public isLeaf: boolean,
    public moduleInfo: RouteModuleInfo,
    public children?: TreeRoute[],
    public configFileName?: string
  ) {
    this.extraMiddlewares = [];
  }
  public addMiddleware(unImport: Import, configFileName?: string) {
    this.extraMiddlewares.push({
      unImport,
      configFileName,
    });
  }
  public addChildRoute(filePath: string) {}
}
