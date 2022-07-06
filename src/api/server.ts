import { serve } from "../../deps/http.ts";
import { BetterMap } from "../../deps/utils.ts";

type ReqCallback = (req: Request) => Promise<Response>;

type Middleware = (req: Request) => Promise<Response | void>;

export class AquaServer {
//  _baseURL: string;
  router: Router;
  port: number;
//  staticFolder: string;
  constructor() {
    this.router = new Router();
    this.port = 8000;
  }
  setPort(port: number): AquaServer {
    if (!port) {
      throw new ReferenceError("Cannot set port without providing one");
    }
    const validPort = Number(port);
    if (!validPort || isNaN(validPort)) {
      throw new TypeError("Port must be a number");
    }
    this.port = validPort;
    return this;
  }
  async handler(req: Request): Promise<Response> {
    this.router.middleware.forEach((fn) => fn(req));

    const reqURL = new URL(req.url);
    return await this.router.handle(reqURL.pathname, req.method, req);
  }
  async start() {
    await serve(this.handler.bind(this), { port: this.port });
    console.log(`AquaServer app started at localhost on port ${this.port} <http://localhost:${this.port}>`);
  }
}

export class Router {
  routes: BetterMap<string, ReqCallback>;
  middleware: Middleware[];
  constructor() {
    this.routes = new BetterMap<string, ReqCallback>(
      "Allowed Routes",
    );
    this.middleware = [];
  }
  use(callback: Middleware): void {
    this.middleware.push(callback);
  }
  addRoute(
    route: string,
    method: string,
    callback: ReqCallback,
  ): void {
    const exists = this.routes.get(route);
    if (exists) {
      console.warn(
        `Handler for ${route} already defined. It will be overwritten by your new handler.`,
      );
    }
    this.routes.set(`${method}_${route}`, callback);
  }
  async handle(route: string, method: string, req: Request): Promise<Response> {
    const handler = this.routes.get(`${method}_${route}`);
    if (!handler) {
      return new Response(JSON.stringify({ message: "Route not found!" }), {
        status: 404,
        headers: {
          "content-type": "application/json; charset=utf-8",
        },
      });
    }
    return await handler(req);
  }
}
