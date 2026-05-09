import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    // Resolves @/* path aliases from tsconfig.json so tests can use
    // the same import style as the app (e.g. "@/lib/auditEngine").
    tsconfigPaths(),
  ],
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["lib/**/*.ts"],
      exclude: ["lib/validation/**"],
    },
  },
});
