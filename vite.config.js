import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    open: {
      target: 'chrome',
      app: {
        name: 'chrome',
        arguments: ['--auto-open-devtools-for-tabs']
      }
    }
  }
})
