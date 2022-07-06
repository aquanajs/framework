import { defineAquaConfig } from "@aqua/src/mod.ts";
const __dirname = new URL(".", import.meta.url).pathname;

export default defineAquaConfig({
  name: "AquaApp",
  template: `${__dirname}/template.html`,
  head: {
    title: "Aqua App",
    meta: [
      {
        name: "viewport",
        friendlyName: "viewport",
        content: "width=device-width, initial-scale=1",
      },
    ],
    link: [],
  },
  generateCSS: true,
});
