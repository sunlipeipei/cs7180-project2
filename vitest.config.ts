import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'happy-dom',
        globalSetup: ['./src/test-utils/global-setup.ts'],
        setupFiles: ['./__tests__/setup.ts', './src/test-utils/fetch-mock.ts'],
        hookTimeout: 60000,
        fileParallelism: false,
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 80,
                statements: 80
            },
            exclude: [
                'node_modules/',
                '.next/',
                'vitest.config.ts',
                'next.config.ts',
                'tailwind.config.ts',
                'postcss.config.mjs',
                'eslint.config.mjs',
                'src/app/layout.tsx', // Next.js layouts usually don't need heavy unit testing
                '__tests__/**'       // Don't measure coverage of the tests themselves
            ]
        },
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
})
