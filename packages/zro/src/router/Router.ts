import { addRoute, createRouter } from 'rou3'
import { Route } from './Route'

export class Router {
  private router = createRouter()
  public addRoute(route: Route<any, any>) {
    addRoute(this.router, '', route.getPath(), route)
  }
}
