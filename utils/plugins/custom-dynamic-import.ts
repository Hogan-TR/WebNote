import type { PluginOption } from 'vite'

// customDynamicImport resolve the resource path to get
export default function customDynamicImport(): PluginOption {
  return {
    name: 'custom-dynamic-import',
    renderDynamicImport() {
      return {
        left: `
        {
          const dynamicImport = (path) => import(path);
          dynamicImport(
          `,
        right: ')}',
      }
    },
  }
}
