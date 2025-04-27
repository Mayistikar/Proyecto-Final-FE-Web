import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  optimizeDeps: {
    exclude: [
      'chunk-Z4CVLIV7',
      'chunk-SFLTZJ2N',
      'chunk-QFVGMXDZ',
      'chunk-R5WR6IFL',
      'chunk-Z7VFPKMX'
    ]
  }
});
