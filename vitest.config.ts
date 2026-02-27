import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'happy-dom',
        setupFiles: ['./__tests__/setup.ts'],
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            thresholds: {
                lines: 70,
                functions: 70,
                branches: 70,
                statements: 70
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
