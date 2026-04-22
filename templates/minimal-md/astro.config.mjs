import { defineConfig } from "astro/config";
import { notro } from "notro-loader/integration";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [notro()],
});
