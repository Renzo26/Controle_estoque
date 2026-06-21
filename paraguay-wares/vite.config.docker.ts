// Build de produção SPA (estático) para servir via Nginx no Docker/EasyPanel.
// NÃO usa o TanStack Start/nitro — gera um SPA client-only em dist/ a partir de
// index.html -> src/main.tsx. Mantém o vite.config.ts (Start/SSR) intacto para o dev.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsConfigPaths(),
  ],
  build: {
    outDir: "dist",
  },
});
