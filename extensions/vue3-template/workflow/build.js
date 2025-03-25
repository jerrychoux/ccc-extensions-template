import * as esbuild from 'esbuild'
import * as fs from 'fs'
import * as terser from 'terser'
import path from 'path'
import javascriptObfuscator from 'javascript-obfuscator'
import chalk from 'chalk'

// 入口文件配置
const entryPoints = [{ path: './src/packaging.ts', compress: true, obfuscate: false }]

// ====================== 工具函数 ======================
/**
 * 获取输出文件路径
 * @param {string} srcPath - 源文件路径
 * @returns {string} 输出文件路径
 */
const getDistPath = (srcPath) => path.join('./dist', path.basename(srcPath, '.ts') + '.cjs')

/**
 * 检查是否需要重新构建
 * @param {string} srcPath - 源文件路径
 * @param {string} distPath - 输出文件路径
 * @returns {boolean} 是否需要重新构建
 */
const shouldRebuild = (srcPath, distPath) => {
  if (!fs.existsSync(distPath)) return true // 如果 dist 文件不存在，则需要构建
  const srcStats = fs.statSync(srcPath)
  const distStats = fs.statSync(distPath)
  return srcStats.mtimeMs > distStats.mtimeMs // 如果 src 更新，则需要构建
}

/**
 * 检查所有入口文件是否需要构建
 * @returns {boolean} 是否需要进行构建
 */
const needsBuild = () => entryPoints.some((entry) => shouldRebuild(entry.path, getDistPath(entry.path)))

/**
 * 处理错误并抛出
 * @param {string} message - 错误信息
 * @throws {Error}
 */
const handleError = (message) => {
  throw new Error(message)
}

// ====================== 插件定义 ======================
// Terser 压缩配置
const terserConfig = {
  compress: { drop_console: true, drop_debugger: true },
  format: { comments: false },
}

/**
 * 获取 Terser 配置
 * @param {Object} entry - 入口文件配置
 * @returns {Object} Terser 配置
 */
const getTerserConfig = (entry) => (typeof entry.compress === 'object' ? entry.compress : terserConfig)

// JavaScript Obfuscator 混淆配置
const obfuscationConfig = {
  compact: true, // 压缩代码，移除多余的空格和换行符
  controlFlowFlattening: false, // 控制流扁平化，使代码结构更复杂
  controlFlowFlatteningThreshold: 0.8, // 控制流扁平化的应用比例 (0-1)
  deadCodeInjection: false, // 是否注入死代码，增加代码复杂度
  deadCodeInjectionThreshold: 0.3, // 死代码注入的比例 (0-1)
  debugProtection: false, // 防止代码在调试器中运行
  stringArray: false, // 是否将字符串转换为数组形式
  rotateStringArray: false, // 随机打乱字符串数组顺序
  selfDefending: false, // 增加自我防护，防止代码被篡改
  splitStrings: false, // 是否将长字符串拆分为多个部分
  splitStringsChunkLength: 5, // 拆分字符串时的最大长度
  identifierNamesGenerator: 'mangled', // 使用短变量名
}

// 内存存储中间结果
const processedFiles = new Map()

/**
 * 查找对应的入口文件配置
 * @param {string} outputPath - 输出文件路径
 * @returns {Object} 入口文件配置
 */
const findEntryConfig = (outputPath) =>
  entryPoints.find((entry) => outputPath.endsWith(path.basename(entry.path, '.js') + '.cjs'))

/**
 * 压缩代码
 * @param {string} code - 源代码
 * @param {Object} entry - 入口文件配置
 * @returns {Promise<string>} 压缩后的代码
 */
const minifyCode = async (code, entry) => {
  const minified = await terser.minify(code, getTerserConfig(entry))
  if (minified.error) handleError(`Terser minification failed: ${minified.error}`)
  return minified.code
}

/**
 * 混淆代码
 * @param {string} code - 源代码
 * @returns {string} 混淆后的代码
 */
const obfuscateCode = (code) => {
  return javascriptObfuscator.obfuscate(code, obfuscationConfig).getObfuscatedCode()
}

/**
 * 文件写入
 * @param {string} filePath - 文件路径
 * @param {string} code - 写入的代码
 */
const writeFile = (filePath, code) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, code)
}

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
          const minified = await minifyCode(code, entry)
          processedFiles.set(outputFile.path, minified)
          console.log(`Compressed: ${outputFile.path}`)
        } catch (err) {
          handleError(err.message)
        }
      }
    })
  },
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
          const obfuscatedCode = obfuscateCode(code)
          processedFiles.set(outputFile.path, obfuscatedCode)
          console.log(`Obfuscated: ${outputFile.path}`)
        } catch (err) {
          handleError(`Obfuscation failed for ${outputFile.path}: ${err.message}`)
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
          writeFile(outputFile.path, finalCode)
        } catch (err) {
          handleError(`Failed to write file ${outputFile.path}: ${err.message}`)
        }
      }
    })
  },
}

// ====================== 主逻辑 ======================
const runBuild = async () => {
  const baseCommand = `yarn run build`
  process.stdout.write(`[?] ${baseCommand}`)

  try {
    await esbuild.build({
      entryPoints: entryPoints.map((entry) => entry.path),
      outdir: './dist',
      bundle: false,
      minify: true,
      platform: 'node',
      target: 'node14',
      format: 'cjs',
      write: false,
      outExtension: { '.js': '.cjs' },
      plugins: [terserPlugin, obfuscationPlugin, writeFilePlugin],
    })

    process.stdout.clearLine()
    process.stdout.cursorTo(0)
    console.log(chalk.greenBright(`[√] ${baseCommand}`))
  } catch (error) {
    process.stdout.clearLine()
    process.stdout.cursorTo(0)
    console.log(chalk.redBright(`[x] ${baseCommand}`))
    console.error(error.message)
  }
}

if (needsBuild()) {
  runBuild()
}
