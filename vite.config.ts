import { defineConfig, resolveEnvPrefix } from 'vite'
import path, { resolve } from 'path'
import react from '@vitejs/plugin-react'
import zipPack from 'vite-plugin-zip-pack'
import manifest from './manifest'
import makeManifest from './utils/plugins/make-manifest'
import customDynamicImport from './utils/plugins/custom-dynamic-import'

const root = resolve(__dirname, 'src')
const pagesDir = resolve(root, 'pages')
const assetsDir = resolve(root, 'assets')
const outDir = resolve(__dirname, 'build')
const publicDir = resolve(__dirname, 'public')

const isDev = process.env.__DEV__ === 'true'
const isProd = !isDev

export default defineConfig(({ mode }) => {
  return {
    resolve: {
      alias: {
        '@src': root,
        '@pages': pagesDir,
        '@assets': assetsDir,
      },
    },
    publicDir,
    build: {
      outDir,
      // sourcemap: isDev,
      minify: isProd,
      reportCompressedSize: isProd,
      rollupOptions: {
        input: {
          popup: resolve(pagesDir, 'popup', 'index.html'),
          options: resolve(pagesDir, 'options', 'index.html'),
          content: resolve(pagesDir, 'content', 'index.ts'),
          contentInject: resolve(pagesDir, 'content', 'inject.ts'),
          background: resolve(pagesDir, 'background', 'index.ts'),
        },
        watch: {
          include: ['src/**', 'vite.config.ts'],
          exclude: ['node_modules/**', 'src/**/*.spec.ts'],
        },
        output: {
          entryFileNames: (entryInfo) => {
            const { name } = path.parse(entryInfo.name as string)
            if (name === 'contentInject') {
              return `src/pages/content/inject.js`
            }
            return `src/pages/[name]/index.js`
          },
          chunkFileNames: isDev ? 'assets/js/[name].js' : 'assets/js/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            const { name } = path.parse(assetInfo.name as string)
            return `assets/[ext]/${name}-[hash].[ext]`
          },
        },
      },
    },
    plugins: [
      react(),
      makeManifest(manifest, {
        isDev,
        // contentScriptCssKey: regenerateCacheInvalidationKey(),
      }),
      customDynamicImport(),
      zipPack({
        outDir: `package`,
        inDir: 'build',
        // @ts-ignore
        outFileName: `${manifest.short_name ?? manifest.name.replaceAll(' ', '-')}-extension-v${
          manifest.version
        }.zip`,
      }),
    ],
  }
})

/**
 * Generate content script css key
 */
let cacheInvalidationKey: string = generateKey()

function regenerateCacheInvalidationKey() {
  cacheInvalidationKey = generateKey()
  return cacheInvalidationKey
}

function generateKey(): string {
  return `${(Date.now() / 100).toFixed()}`
}
