import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            // Also report source files that no test imports
            include: ["src/**/*.ts"],
            exclude: ["src/**/*.test.ts", "src/vitestSetup.ts", "src/global.d.ts"],
            provider: "istanbul",
            reporter: ["lcov", "text"],
        },
        environment: "jsdom",
        setupFiles: ["./src/vitestSetup.ts"],
    },
});
