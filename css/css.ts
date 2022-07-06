import { BetterMap } from "../deps/utils.ts";
import { CSSAttribute, validRegex } from "./attributes.ts";
const __dirname = new URL(".", import.meta.url).pathname;

const template = Deno.readTextFileSync(`${__dirname}/assets/default.css`)

export type CSSClass = Partial<Record<CSSAttribute, unknown>>;

export default function CSS(classes: string): string {
    return `${template}\n\n/*\n * GENERATED CSS\n * BY AQUANA\n */\n\n${generateCSS(classes)}`
}


function generateCSS(classes: string): string {
  const classData = generate(classes.split(" "));
  return classData.map((attributes, className) => {
    return `.${className} {\n${Object.entries(attributes).map(([k, v]) => `\t${k}: ${v};`).join("\n")}\n}`
  }).join("\n");
}

function generate(classes: string[]): BetterMap<string, CSSClass> {
  const classMap = new BetterMap<string, CSSClass>();
  for (const className of classes) {
    const css = parseClass(className);
    if (!css) continue;
    const newClassName = escapeClassName(className)
    classMap.set(newClassName, css);
  }
  return classMap;
}

function escapeClassName(className: string) {
  return className.replace(/([!"#$%&'()*+,-./:;<=>?@[\\\]^`{|}])/g, '\\$&');
}

export function parseClass(className: string): CSSClass | null {
  const whichAttribute = validRegex.find((x) => x.regex.test(className));
  console.log(className)
  if (!whichAttribute) return null;
  const value = whichAttribute.regex.exec(className);
  console.log(className, value)
  if (!value) return null;
  const css: CSSClass = {};
  for (const item of whichAttribute.name) {
    css[item] = whichAttribute.output(value[1]);
  }
  return css;
}

// console.log(CSS("p-4rem mx-auto decorate-overline text-#ff00c3/20 size-5rem"))