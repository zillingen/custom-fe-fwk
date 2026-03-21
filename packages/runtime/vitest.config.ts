/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    reporters: 'verbose',
    environment: 'jsdom',
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['index.ts', 'src/**/*.types.ts'],
    },
  },
})
