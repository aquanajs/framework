import Aqua from "./aqua.config.ts"

const __dirname = new URL(".", import.meta.url).pathname;

await Aqua.start(__dirname)