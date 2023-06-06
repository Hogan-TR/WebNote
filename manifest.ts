import packageJson from './package.json'

const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*', '<all_urls>'],
      js: ['src/pages/content/index.js'],
      // KEY for cache invalidation
      // css: ['assets/css/contentStyle<KEY>.chunk.css'],
    },
  ],
}

export default manifest
