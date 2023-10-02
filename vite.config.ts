import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import zipPack from 'vite-plugin-zip-pack'
import * as path from 'path'

//@ts-ignore
import manifest from './src/manifest'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@background': path.resolve(__dirname, 'src/background'),
        '@content': path.resolve(__dirname, 'src/content'),
        '@options': path.resolve(__dirname, 'src/options'),
        '@popup': path.resolve(__dirname, 'src/popup'),
        '@utils': path.resolve(__dirname, 'src/utils'),
      },
    },

    build: {
      emptyOutDir: true,
      outDir: 'build',
    },

    plugins: [
      crx({ manifest }),
      react(),
      zipPack({
        outDir: `package`,
        inDir: 'build',
        //@ts-ignore
        outFileName: `${manifest.short_name ?? manifest.name.replaceAll(' ', '-')}-extension-v${manifest.version}.zip`,
      }),
    ],
  }
})
