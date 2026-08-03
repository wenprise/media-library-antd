import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

/** Builds the package as ESM with declarations and a separately exported stylesheet. */
export default defineConfig({
	plugins: [
		react(),
		dts({
			include: ["src"],
			insertTypesEntry: true,
			tsconfigPath: "./tsconfig.json",
		}),
	],
	build: {
		lib: {
			entry: resolve(import.meta.dirname, "src/index.ts"),
			formats: ["es"],
			fileName: "index",
			cssFileName: "style",
		},
		rollupOptions: {
			external: [
				"@ant-design/icons",
				"antd",
				"react",
				"react-dom",
				"react/jsx-runtime",
			],
		},
	},
});
