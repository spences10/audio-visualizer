import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { playwright } from 'vite-plus/test/browser-playwright';
import { defineConfig } from 'vite-plus';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({ adapter: adapter(), preprocess: vitePreprocess() }),
	],
	fmt: {
		useTabs: true,
		singleQuote: true,
		trailingComma: 'all',
		printWidth: 70,
		proseWrap: 'always',
		svelte: true,
		sortTailwindcss: { stylesheet: './src/app.css' },
		ignorePatterns: [
			'.svelte-kit/**',
			'build/**',
			'test-results/**',
			'playwright-report/**',
			'pnpm-lock.yaml',
			'static/**',
		],
	},
	lint: {
		ignorePatterns: [
			'.svelte-kit/**',
			'build/**',
			'test-results/**',
			'playwright-report/**',
		],
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }],
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts'],
				},
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
				},
			},
		],
	},
});
