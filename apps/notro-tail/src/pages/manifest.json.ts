import type { APIContext } from "astro";
import config from "../config";

export async function GET(_context: APIContext) {
  const manifest = {
    name: config.site.name,
    short_name: config.site.name,
    description: config.site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: config.favicon.svg,
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
      ...(config.favicon.appleTouchIcon
        ? [
            {
              src: config.favicon.appleTouchIcon,
              type: "image/png",
              sizes: "180x180",
              purpose: "any",
            },
          ]
        : []),
      ...(config.favicon.png
        ? [
            {
              src: config.favicon.png,
              type: "image/png",
              sizes: "192x192",
              purpose: "any",
            },
          ]
        : []),
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
