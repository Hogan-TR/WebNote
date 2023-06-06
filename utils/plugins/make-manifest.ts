import * as fs from 'fs'
import * as path from 'path'
import colorLog from '../log'
import ManifestParser from '../manifest-parser'
import type { PluginOption } from 'vite'

const { resolve } = path

const buildDir = resolve(__dirname, '..', '..', 'build')
const publicDir = resolve(__dirname, '..', '..', 'public')

export default function makeManifest(
  manifest: chrome.runtime.ManifestV3,
  config: { isDev: boolean; contentScriptCssKey?: string },
): PluginOption {
  function makeManifest(to: string) {
    if (!fs.existsSync(to)) {
      fs.mkdirSync(to)
    }
    const manifestPath = resolve(to, 'manifest.json')

    // Naming change for cache invalidation
    if (config.contentScriptCssKey !== undefined) {
      const csc: string = config.contentScriptCssKey!
      manifest.content_scripts?.forEach((script) => {
        script.css = script.css?.map((css) => css.replace('<KEY>', csc))
      })
    }

    fs.writeFileSync(manifestPath, ManifestParser.convertManifestToString(manifest))

    colorLog(`\nManifest file copy complete: ${manifestPath}`, 'success')
  }

  return {
    name: 'make-manifest',
    buildStart() {
      if (config.isDev) {
        // TODO
        makeManifest(buildDir)
      }
    },
    buildEnd() {
      if (config.isDev) {
        return
      }
      makeManifest(publicDir)
    },
  }
}
