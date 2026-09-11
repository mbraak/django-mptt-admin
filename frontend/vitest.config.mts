import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            provider: "istanbul",
            reporter: ["lcov", "text"],
        },
        environment: "jsdom",
        setupFiles: ["./src/vitestSetup.ts"],
    },
});
