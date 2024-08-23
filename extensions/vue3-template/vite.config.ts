import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, basename } from 'path'

interface Bundles {
  [entryAlias: string]: string
}

export function relativePathToRoot(bundles: Bundles): Plugin {
  return {
    name: 'relative-path-to-root',
    generateBundle(options, bundle) {
      for (const fileName in bundle) {
        if (Object.prototype.hasOwnProperty.call(bundle, fileName)) {
          const file = bundle[fileName]
          if (file.type === 'chunk') {
            if (bundles[file.name] && bundles[file.name].endsWith('.ts')) {
              file.fileName = bundles[file.name].replace('.ts', '.js')
            } else {
              if ('_plugin-vue_export-helper' === file.name) {
                file.fileName = basename(file.fileName)
              } else {
                console.warn('no match', file.name)
              }
            }
          }
        }
      }
    },
  }
}

const helperPattern = /\.{0,2}\/?_plugin-vue_export-helper(-.*?)?.js/gi
export function modifyPluginVueExportHelper(bundles: Bundles): Plugin {
  return {
    name: 'modify-plugin-vue-export-helper',
    generateBundle(options, bundle) {
      for (const fileName in bundle) {
        if (Object.prototype.hasOwnProperty.call(bundle, fileName)) {
          const file = bundle[fileName]
          if (file.type === 'chunk') {
            if (bundles[file.name] && bundles[file.name].endsWith('.ts')) {
              let upLevel = bundles[file.name].split('/').length - 1
              let realName = file.code.match(helperPattern)?.[0]
              if (realName) {
                realName = realName.replace(/^\.{0,2}\/?/gi, '')
                if (upLevel > 0) {
                  file.code = file.code.replace(helperPattern, `${'../'.repeat(upLevel)}${realName}`)
                } else {
                  file.code = file.code.replace(helperPattern, `./${realName}`)
                }
              }
            }
          }
        }
      }
    },
  }
}

const bundles: Bundles = {
  main: 'main.ts',
  defaultPanel: 'panels/default/index.ts',
}

const getInput = () => Object.fromEntries(Object.entries(bundles).map(([key, value]) => [key, resolve(__dirname, `./src/${value}`)]))

export default defineConfig({
  base: './',
  plugins: [vue()],
  optimizeDeps: {
    exclude: ['electron'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    minify: false,
    outDir: 'dist',
    rollupOptions: {
      preserveEntrySignatures: 'allow-extension',
      input: getInput(),
      output: { format: 'cjs', chunkFileNames: "'[name].js" },
      plugins: [relativePathToRoot(bundles), modifyPluginVueExportHelper(bundles)],
    },
  },
})
