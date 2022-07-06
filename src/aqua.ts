import { generate } from "../css/mod.ts";
import { BetterMap, importAllTextFiles } from "../deps/utils.ts";

import { AquaServer } from "./api/server.ts";

const whatsInside = /\<template\>((?:.|\n)+)\<\/template\>/s;

const test = `<template>
<div class = "p-4rem">
    <div class = "size-5rem">HELLO</div>
</div>
</template>`
// whatsInside.exec(test)

const defaultTemplate = `<!DOCTYPE html>
<html>
    <head>%head</head>
    <body>%body</body>
</html>`;

const invalidPage = `<div>Cannot get %route. Route doesn't exist.</div>`;

export interface MetaConfig {
  name?: string;
  property?: string;
  friendlyName: string;
  content: string;
}

export interface LinkConfig {
  rel: string;
  href: string;
}

export interface HeadConfig {
  title?: string;
  titleTemplate?: string;
  meta: MetaConfig[];
  link: LinkConfig[];
}

export interface ServerConfig {
  port?: number;
}

export interface AquaConfig {
  name?: string;
  head: HeadConfig;
  template?: string;
  generateCSS?: boolean;
}

export class Aqua {
  name: string;
  head: HeadConfig;
  routes: BetterMap<string, string>;
  app: AquaServer;
  css: string;
  generateCSS: boolean;
  template: string;
  constructor(config: AquaConfig) {
    this.name = config.name || "Aqua App";
    this.head = config.head;
    this.template = config.template || defaultTemplate;
    this.routes = new BetterMap<string, string>("Routes");
    this.app = new AquaServer();
    this.css = "";
    this.generateCSS = config.generateCSS || false;
  }
  createHead(): string {
    return `
      <title>${
      (this.head.titleTemplate || "%s").replace(
        /%s/g,
        this.head.title || "Unnamed App",
      )
    }</title>
      ${this.createMeta()}
      ${this.createLink()}
      <style>\n${this.css}\n</style>
      `;
  }
  createMeta(): string {
    return this.head.meta.map((x) => {
      `<meta ${x.property ? "property" : "name"} = "${
        x.property ? x.property : x.name
      }" content = "${x.content}" />`;
    }).join("\n");
  }
  createLink(): string {
    return this.head.link.map((x) => {
      `<link rel = "${x.rel}" href = "${x.href}" />`;
    }).join("\n");
  }
  render(template: string) {
    return this.template.replace("%head", this.createHead()).replace(
      "%body",
      template,
    );
  }
  async start(dirname: string) {
    const pages = await importAllTextFiles(`${dirname}/pages`, ["aqua"]);
    if (this.generateCSS) {
      const htmlData = Object.values(pages).map((x) => {
        return whatsInside.exec(x)?.[1] || ""
      }
      ).join("\n");
      this.css = generate(htmlData);
    }
    for (const route in pages) {
//      console.log(whatsInside, pages[route]);
//      console.log(whatsInside.exec(pages[route]));
      this.routes.set(
        `/${route === "index" ? "" : route}`,
        whatsInside.exec(pages[route])?.[1] ||
          invalidPage.replace("%route", route),
      );
    }
    this.app.setPort(8000);
    this.routes.forEach((v, k) =>
      this.app.router.addRoute(
        k,
        "GET",
        async (req: Request) =>
          new Response(this.render(v), {
            headers: { "Content-Type": "text/html" },
          }),
      )
    );
    console.log(this.app.router.routes);
    this.app.start();
  }
}
