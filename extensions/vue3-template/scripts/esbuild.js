import * as esbuild from 'esbuild'
import * as fs from 'fs'
import * as terser from 'terser'
import path from 'path'
import javascriptObfuscator from 'javascript-obfuscator'

// Terser 压缩配置
const terserConfig = {
  compress: { drop_console: true, drop_debugger: true },
  format: { comments: false },
}

const getTerserConfig = (entry) => (typeof entry.compress === 'object' ? entry.compress : terserConfig)

// 入口文件配置
const entryPoints = [
  { path: './src/preinstall.ts', compress: false, obfuscate: false },
  { path: './src/packaging.ts', compress: true, obfuscate: false },
]

// 内存存储中间结果
const processedFiles = new Map()

// 查找对应的入口文件配置
const findEntryConfig = (outputPath) =>
  entryPoints.find((entry) => outputPath.endsWith(path.basename(entry.path, '.js') + '.cjs'))

// Terser 压缩插件
const terserPlugin = {
  name: 'terser-plugin',
  setup(build) {
    build.onEnd(async (result) => {
      for (const outputFile of result.outputFiles || []) {
        if (!outputFile.path.endsWith('.cjs')) continue

        const entry = findEntryConfig(outputFile.path)
        if (!entry || !entry.compress) continue

        try {
          const code = processedFiles.get(outputFile.path) || outputFile.text
          const minified = await terser.minify(code, getTerserConfig(entry))

          if (minified.error) {
            throw new Error(`Terser minification failed: ${minified.error}`)
          }

          // 存储压缩后的代码
          processedFiles.set(outputFile.path, minified.code)
          console.log(`Compressed: ${outputFile.path}`)
        } catch (err) {
          console.error(err.message)
        }
      }
    })
  },
}

// JavaScript Obfuscator 混淆配置
const obfuscationConfig = {
  compact: true, // 压缩代码，移除多余的空格和换行符
  controlFlowFlattening: true, // 控制流扁平化，使代码结构更复杂
  controlFlowFlatteningThreshold: 0.8, // 控制流扁平化的应用比例 (0-1)
  deadCodeInjection: true, // 是否注入死代码，增加代码复杂度
  deadCodeInjectionThreshold: 0.3, // 死代码注入的比例 (0-1)
  debugProtection: true, // 防止代码在调试器中运行
  stringArray: true, // 是否将字符串转换为数组形式
  rotateStringArray: true, // 随机打乱字符串数组顺序
  selfDefending: true, // 增加自我防护，防止代码被篡改
  splitStrings: true, // 是否将长字符串拆分为多个部分
  splitStringsChunkLength: 5, // 拆分字符串时的最大长度
  identifierNamesGenerator: 'mangled', // 使用短变量名
}

// JavaScript Obfuscator 混淆插件
const obfuscationPlugin = {
  name: 'obfuscation-plugin',
  setup(build) {
    build.onEnd((result) => {
      for (const outputFile of result.outputFiles || []) {
        if (!outputFile.path.endsWith('.cjs')) continue

        const entry = findEntryConfig(outputFile.path)
        if (!entry || !entry.obfuscate) continue

        try {
          const code = processedFiles.get(outputFile.path) || outputFile.text
          const obfuscatedCode = javascriptObfuscator.obfuscate(code, obfuscationConfig).getObfuscatedCode()

          // 存储混淆后的代码
          processedFiles.set(outputFile.path, obfuscatedCode)
          console.log(`Obfuscated: ${outputFile.path}`)
        } catch (err) {
          console.error(`Obfuscation failed for ${outputFile.path}: ${err.message}`)
        }
      }
    })
  },
}

// 文件写入插件
const writeFilePlugin = {
  name: 'write-file-plugin',
  setup(build) {
    build.onEnd((result) => {
      for (const outputFile of result.outputFiles || []) {
        if (!outputFile.path.endsWith('.cjs')) continue

        try {
          const finalCode = processedFiles.get(outputFile.path) || outputFile.text

          fs.mkdirSync(path.dirname(outputFile.path), { recursive: true })
          fs.writeFileSync(outputFile.path, finalCode)
          console.log(`File written: ${outputFile.path}`)
        } catch (err) {
          console.error(`Failed to write file ${outputFile.path}: ${err.message}`)
        }
      }
    })
  },
}

// esbuild 构建配置
esbuild
  .build({
    entryPoints: entryPoints.map((entry) => entry.path), // 提取路径作为输入文件
    outdir: './dist', // 输出目录
    bundle: true, // 打包所有依赖
    minify: true, // 启用压缩
    platform: 'node', // Node.js 平台
    target: 'node14', // 目标为 Node.js 14
    format: 'cjs', // 输出 CommonJS 格式
    write: false, // 不自动写文件，交由插件处理
    outExtension: { '.js': '.cjs' }, // 将 .js 文件扩展名替换为 .cjs
    plugins: [terserPlugin, obfuscationPlugin, writeFilePlugin],
  })
  .then(() => {
    console.log('Build, compression, obfuscation, and file writing completed successfully!')
  })
  .catch((error) => {
    console.error('Build failed:', error.message)
  })
