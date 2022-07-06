import { DOMParser } from "../deps/parser.ts";
import { generateString } from "../deps/generator.ts";
import type { Element } from "../deps/parser.ts";
import { AttributeTypes, CSSAttribute, CSSAttributes } from "./attributes.ts";

const existingClasses: string[] = [];

const __dirname = new URL(".", import.meta.url).pathname;

const html_regex = /(?:\b((?:\w|-)+)(?:\s)*=(?:\s)*")([^"]*)/g;
const data = await Deno.readTextFileSync(
  __dirname + "/assets/testdocument.html",
);

interface ClassAndCSS {
  class: string;
  css: string;
}

function extractAttributes(html: string) {
  const attributes: Record<CSSAttribute | string, string> = {};
  let m;
  do {
    m = html_regex.exec(html);
    if (m && CSSAttributes.includes(m[1] as CSSAttribute)) {
      attributes[m[1] as CSSAttribute] = m[2];
    }
  } while (m);
  console.log(attributes);
  return attributes;
}

function generateClass() {
  let className = generateString(5);
  while (existingClasses.includes(className)) {
    className = generateString(5);
  }
  existingClasses.push(className);
  return className;
}

function generateCSS(attributes: Record<CSSAttribute | string, string>) {
  const css: string[] = [];
  for (const key in attributes) {
    if (!CSSAttributes.includes(key as CSSAttribute)) continue;
    css.push(
      `${key}: ${
        AttributeTypes[attributes[key] as CSSAttribute] === "quotes"
          ? `"${attributes[key]}"`
          : attributes[key]
      };`,
    );
  }
  return css.join(" ");
}

function compute(acc: ClassAndCSS[], html: Element) {
  const attributes = extractAttributes(html.outerHTML);
  if (Object.entries(attributes).length === 0) return acc;
  acc.push({ class: generateClass(), css: generateCSS(attributes) });
  if (html.children.length !== 0) {
    let i = 0;
    while (html.children.item(i)) {
      acc.push(...compute(acc, html.children.item(i)));
      i += 1;
    }
  }
  return acc;
}

export function generate(html: string) {
  const generatedCSS = [];
  const result = new DOMParser().parseFromString(html, "text/html");
  if (!result) return null;
  generatedCSS.push(compute([], result.body));
  return generatedCSS;
}

console.log(generate(data));
