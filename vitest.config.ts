import {playwright} from '@vitest/browser-playwright'
import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text-summary', 'json', 'html'],
    },
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/**/__test__/browser/**'],
          environment: 'jsdom',
          typecheck: {
            enabled: true,
            tsconfig: 'tsconfig.dist.json',
          },
        },
      },
      {
        test: {
          name: 'browser',
          include: ['src/__test__/browser/**/*.test.{ts,tsx}'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{browser: 'chromium', launch: {channel: 'chromium'}}],
          },
        },
      },
    ],
  },
})
