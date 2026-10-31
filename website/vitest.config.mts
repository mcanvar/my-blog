import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      'server-only': fileURLToPath(new URL('./src/test/server-only-stub.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'amplify/**/*.test.ts',
      'scripts/**/*.test.ts',
    ],
    exclude: ['node_modules', '.next', 'e2e'],
    // next-intl imports `next/navigation` without an extension; let Vite resolve it.
    server: { deps: { inline: ['next-intl'] } },
  },
})
