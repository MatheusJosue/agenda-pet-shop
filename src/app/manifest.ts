import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Agenda Pet Shop",
    short_name: "Agenda Pet",
    description: "Sistema de gestao para pet shops",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#fff9fb",
    theme_color: "#e8327b",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
