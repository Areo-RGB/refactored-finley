import { defineConfig } from 'vite'

export default defineConfig({
  // Root directory for the project
  root: '.',

  // Public directory for static assets
  publicDir: 'public',

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Don't minify for easier debugging
    minify: false,
    // Generate source maps
    sourcemap: true
  },

  // Development server configuration
  server: {
    port: 5173,
    host: 'localhost',
    open: true, // Automatically open browser
    cors: true,
    // Serve static files
    fs: {
      strict: false
    }
  },

  // Preview server configuration (for built files)
  preview: {
    port: 4173,
    open: true
  },

  // Asset handling
  assetsInclude: ['**/*.mp4', '**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif']
})
