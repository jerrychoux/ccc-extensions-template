import fs from 'fs'
import path, { resolve, join } from 'path'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { builtinModules } from 'module'
import obfuscator from 'rollup-plugin-obfuscator'
import { TInputOptions } from 'javascript-obfuscator/typings/src/types/options/TInputOptions'

type Mode = 'production' | 'develop'
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

function replacePlaceholders(template: string, ...args: string[]): string {
  return args.reduce((result, value, index) => {
    const placeholder = `{${index}}`
    return result.split(placeholder).join(value)
  }, template)
}

const chunkFilePathPattern = /\.{0,2}\/?js\/chunk\.[A-Za-z0-9_\-]+\.js/gi
const vendorFilePathPattern = /\.{0,2}\/?js\/vendor\.[A-Za-z0-9_\-]+\.js/gi
const assetFilePathPatternDevelop =
  /""\s\+\s\(typeof\sdocument\s===\s"undefined"\s\?\srequire\("url"\)\.pathToFileURL\(__dirname\s\+\s"([^"]+\.(?:png|jpg|svg))"\)\.href\s\:\snew\sURL\("([^"]+\.(?:png|jpg|svg))",\sdocument\.currentScript\s&&\sdocument\.currentScript\.src\s\|\|\sdocument\.baseURI\)\.href\)/
const assetFilePathPatternProduction =
  /""\+\("undefined"==typeof\sdocument\?require\("url"\)\.pathToFileURL\(__dirname\+"([^"]+\.(?:png|jpg|svg))"\)\.href\:new\sURL\("([^"]+\.(?:png|jpg|svg))",document\.currentScript&&document\.currentScript\.src\|\|document\.baseURI\)\.href\)/
function fixImportFilesPath(mode: Mode): Plugin {
  const getRelativePath = (from: string, to: string) =>
    path
      .relative(path.dirname(from), to)
      .replace(/\\/g, '/')
      .replace(/^(?!\.)/, './')

  return {
    name: 'fix-import-files-path',
    generateBundle(options, bundle) {
      for (const fileName in bundle) {
        const file = bundle[fileName]
        if (file.type === 'chunk') {
          if (file.fileName.match(chunkFilePathPattern) || file.fileName.match(vendorFilePathPattern)) {
            continue
          }

          const matchChunk = file.code.match(chunkFilePathPattern)
          if (matchChunk) {
            const filePath = path.resolve('./dist', file.fileName)
            const matchPath = path.resolve('./dist', matchChunk[0])
            const relativePath = getRelativePath(filePath, matchPath)

            if (matchChunk[0] !== relativePath) {
              file.code = file.code.replace(chunkFilePathPattern, relativePath)
            }
          }

          const matchVendor = file.code.match(vendorFilePathPattern)
          if (matchVendor) {
            const filePath = path.resolve('./dist', file.fileName)
            const matchPath = path.resolve('./dist', matchVendor[0])
            const relativePath = getRelativePath(filePath, matchPath)

            if (matchVendor[0] !== relativePath) {
              file.code = file.code.replace(vendorFilePathPattern, relativePath)
            }
          }

          const assetFilePathPattern =
            mode === 'production' ? assetFilePathPatternProduction : assetFilePathPatternDevelop
          const matchAsset = file.code.match(assetFilePathPattern)
          if (matchAsset) {
            const replaceTemplate = `{0}.resolve(Editor.Package.getPath({1}), 'dist', '{2}')`
            const pathPattern = /(?:[ ,]?)([a-zA-Z][a-zA-Z0-9]*)\s?=\s?require\(['"]path['"]\)[,;]/
            const matchPath = file.code.match(pathPattern)

            const pathVariableName = mode === 'production' ? (matchPath ? matchPath[1] : 'require("path")') : 'path'
            const extensionName = JSON.stringify(packageJson.name)
            const replaceStr = replacePlaceholders(replaceTemplate, pathVariableName, extensionName, matchAsset[2])
            file.code = file.code.replace(assetFilePathPattern, replaceStr)
          }
        }
      }
    },
  }
}

const obfuscatorConfig: TInputOptions = {
  compact: true, // 压缩代码，移除多余的空格和换行符
  controlFlowFlattening: true, // 控制流扁平化，使代码结构更复杂
  controlFlowFlatteningThreshold: 0.8, // 控制流扁平化的应用比例 (0-1)
  deadCodeInjection: true, // 是否注入死代码，增加代码复杂度
  deadCodeInjectionThreshold: 0.5, // 死代码注入的比例 (0-1)
  debugProtection: true, // 防止代码在调试器中运行
  stringArray: true, // 是否将字符串转换为数组形式
  rotateStringArray: true, // 随机打乱字符串数组顺序
  selfDefending: true, // 增加自我防护，防止代码被篡改
  splitStrings: true, // 是否将长字符串拆分为多个部分
  splitStringsChunkLength: 5, // 拆分字符串时的最大长度
}

function doJsObfuscator(mode: Mode) {
  return mode === 'production'
    ? obfuscator({
        options: obfuscatorConfig,
        exclude: ['node_modules/**'],
      })
    : undefined
}

const inputOption: InputOption = {
  main: 'main.ts',
  defaultPanel: 'panels/default/index.ts',
}

const inputKeys = Object.keys(inputOption)

const getInputs = () =>
  Object.fromEntries(Object.entries(inputOption).map(([key, value]) => [key, resolve(__dirname, `./src/${value}`)]))

const getGlobalVariables = (mode: Mode) => {
  return {
    __EXTENSION_MODE__: JSON.stringify(mode),
    __EXTENSION_VERSION__: JSON.stringify(packageJson.version),
    __EXTENSION_NAME__: JSON.stringify(packageJson.name),
  }
}

export default defineConfig(({ mode }) => ({
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
  define: getGlobalVariables(mode as Mode),
  build: {
    minify: mode === 'production' ? 'terser' : false,
    terserOptions:
      mode === 'production'
        ? {
            compress: { drop_console: true, drop_debugger: true },
            format: { comments: false },
          }
        : undefined,
    outDir: 'dist',
    rollupOptions: {
      preserveEntrySignatures: 'allow-extension',
      input: getInputs(),
      output: {
        format: 'cjs',
        entryFileNames: '[name].js',
        chunkFileNames(info) {
          if (info.name === 'vendor') {
            return 'js/vendor.[hash].js'
          }

          return 'js/chunk.[hash].js'
        },
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
        assetFileNames(info) {
          const filePath = info.name
          const fileExt = path.extname(filePath)
          const fileName = path.basename(filePath, fileExt)
          if (fileExt === '.css') {
            if (fileName.includes('vendor')) {
              return 'assets/vendor.[hash].css'
            }

            if (!inputKeys.includes(fileName)) {
              return 'assets/chunk.[hash].css'
            }
          }

          return 'assets/[name].[hash][extname]'
        },
      },
      plugins: [
        organizeInputFileToCustomFolder(inputOption),
        fixImportFilesPath(mode as Mode),
        doJsObfuscator(mode as Mode),
      ],
      external: ['electron', ...builtinModules],
    },
  },
}))
