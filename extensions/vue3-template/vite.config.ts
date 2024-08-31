import fs from 'fs'
import path, { resolve, join } from 'path'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { builtinModules } from 'module'

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

interface InputOption {
  [entryAlias: string]: string
}

function organizeInputFileToCustomFolder(inputOption: InputOption): Plugin {
  return {
    name: 'organize-input-file-to-custom-folder',
    generateBundle(options, bundle) {
      for (const fileName in bundle) {
        const file = bundle[fileName]
        if (file.type === 'chunk') {
          const input = inputOption[file.name]
          if (input) {
            if (file.name.endsWith('Panel')) {
              file.fileName = join('panels', file.fileName)
            }
          }
        }
      }
    },
  }
}

const chunkFilePathPattern = /\.{0,2}\/?chunk\.[A-Za-z0-9]+\.js/gi
function fixImportChunkFilePath(): Plugin {
  return {
    name: 'fix-import-chunk-file-path',
    generateBundle(options, bundle) {
      for (const fileName in bundle) {
        const file = bundle[fileName]
        if (file.type === 'chunk') {
          if (file.fileName.match(chunkFilePathPattern)) {
            continue
          }

          const match = file.code.match(chunkFilePathPattern)
          if (match) {
            const filePath = path.resolve('./dist', file.fileName)
            const matchPath = path.resolve('./dist', match[0])
            const relativePath = path
              .relative(path.dirname(filePath), matchPath)
              .replace(/\\/g, '/')
              .replace(/^(?!\.)/, './')

            if (match[0] !== relativePath) {
              file.code = file.code.replace(chunkFilePathPattern, relativePath)
            }
          }
        }
      }
    },
  }
}

const inputOption: InputOption = {
  main: 'main.ts',
  defaultPanel: 'panels/default/index.ts',
}

const getInputs = () => Object.fromEntries(Object.entries(inputOption).map(([key, value]) => [key, resolve(__dirname, `./src/${value}`)]))

const globalVariables = {
  __EXTENSION_VERSION__: JSON.stringify(packageJson.version),
  __EXTENSION_NAME__: JSON.stringify(packageJson.name),
}

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
  define: globalVariables,
  build: {
    minify: false,
    outDir: 'dist',
    rollupOptions: {
      preserveEntrySignatures: 'allow-extension',
      input: getInputs(),
      output: {
        format: 'cjs',
        entryFileNames: '[name].js',
        chunkFileNames: 'chunk.[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
      plugins: [organizeInputFileToCustomFolder(inputOption), fixImportChunkFilePath()],
      external: ['electron', ...builtinModules],
    },
  },
})
