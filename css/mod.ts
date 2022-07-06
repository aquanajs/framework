import { DOMParser } from "../deps/parser.ts";
import { generateString } from "../deps/generator.ts";
import type { Element } from "../deps/parser.ts";
import CSS from "./css.ts"

export function generate(html: string) {
    const classes = Array.from(new Set(findClasses(html)).values()).join(" ")
    return CSS(classes)
}

export function findClasses(html: string) {
    const parsed = new DOMParser().parseFromString(html, "text/html");
    if(!parsed) return null;
    const classArr = getClass([], parsed.body);
    return classArr;
}

function getClass(acc: string[], html: Element): string[] {
    if(!html.childElementCount) return [...acc, ...html.classList];
    return [...acc, ...html.classList, ...Array.from(html.children).reduce((acc, x) => {
        return [...acc, ...getClass([], x)]
    }, [] as string[])]
}

const t = `<!DOCTYPE html>
<html>
    <body>
        <div class = "p-2rem mx-auto bg-black text-#ff00c3/20 size-5rem">
            <div class = "p-4rem mx-auto decorate-overline text-#ff00c3/20 size-5rem">
                Something
            </div>
        </div>
    </body>
</html>`
// generate(t)
// console.log(generate(t))