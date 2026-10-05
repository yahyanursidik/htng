import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";

export default defineConfig({
  integrations: [preact()],
  output: "static",
  vite: { server: { proxy: { "/api": "http://127.0.0.1:4323" } } },
});
