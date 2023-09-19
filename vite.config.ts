import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import zipPack from 'vite-plugin-zip-pack'

//@ts-ignore
import manifest from './src/manifest'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
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
