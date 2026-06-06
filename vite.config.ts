import { defineConfig } from 'vite'

export default defineConfig({
  preview: {
    allowedHosts: [
      'www.flameupgh.com',
      'flameupgh.com'
    ]
  }
});