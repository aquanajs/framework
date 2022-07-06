import type { AquaConfig } from "../aqua.ts";
import { Aqua } from "../aqua.ts";

export function defineAquaConfig(config: AquaConfig) { 
    config = validateConfig(config);
    return new Aqua(config)
}

function validateConfig(config: AquaConfig): AquaConfig {
    if(config.head) {
        if(config.head.meta) {
            if(!Array.isArray(config.head.meta)) throw new TypeError("head.meta must be an array.")
            for (const meta of config.head.meta) {
                if(!meta.property && !meta.name) throw new TypeError("head.meta must have either name or property in each element.")
            }
        }
    }
    if(config.template) {
        const template = Deno.readTextFileSync(config.template)
        if(!template.includes("%head")) {
            throw new Error("Template HTML file must have a %head placeholder.")
        }
        if(!template.includes("%body")) {
            throw new Error("Template HTML file must have a %body placeholder.")
        }
        config.template = template;
    }
    return config;

}