import archiver from 'archiver'
import * as fs from 'fs-extra'
import * as path from 'path'

interface ExtensionJson {
  package_version: string
  name: string
  version: string
  author: string
  editor: string
  description: string
  main: string
  panels: {}
  contributions: {}
}

function createExtensionJson(data: Record<string, any> = {}): ExtensionJson {
  return {
    package_version: data.package_version ?? '1.0.0',
    name: data.name ?? 'Default Extension',
    version: data.version ?? '1.0.0',
    author: data.author ?? 'Unknown',
    editor: data.editor ?? 'Unknown',
    description: data.description ?? 'No description provided.',
    main: data.main ?? 'index.js',
    panels: data.panels ?? {},
    contributions: data.contributions ?? {},
  }
}

function extractExtensionJson(obj: Record<string, any>): ExtensionJson {
  const result = {} as ExtensionJson

  const extensionInstance = createExtensionJson()
  const keys = Object.keys(extensionInstance) as (keyof ExtensionJson)[]

  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })

  return result
}

interface PackData {
  type: 'path' | 'content'
  path?: string
  name?: string
  content?: string
}

function generateZip(datas: PackData[], filePath: string) {
  return new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(filePath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    // 当压缩包生成完成时
    output.on('close', () => {
      console.log(`Package created: ${filePath}`)
      // 成功时调用 resolve
      resolve()
    })

    // 处理警告
    archive.on('warning', (err) => {
      if (err.code !== 'ENOENT') {
        console.warn(`Warning: ${err.message}`)
      }
    })

    // 处理错误
    archive.on('error', (err) => {
      // 错误时调用 reject
      reject(new Error(`Error creating zip: ${err.message}`))
    })

    for (const data of datas) {
      const { type, path, name, content } = data
      if (type === 'content') {
        if (!content || !name) {
          console.error(`Invalid path or context.`)
          continue
        }

        archive.append(content, { name })
      } else {
        if (path && !fs.existsSync(path)) {
          console.error(`Path does not exist: ${path}`)
          continue
        }

        const stats = fs.statSync(path!)
        if (stats.isDirectory()) {
          archive.directory(path!, name ?? false)
        } else {
          archive.file(path!, { name: name! })
        }
      }
    }

    archive.pipe(output)
    archive.finalize()
  })
}

function deleteOldPackage(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`Deleting old package: ${filePath}`)
      fs.removeSync(filePath) // 同步删除旧的包
    }
  } catch (err) {
    console.error(`Failed to delete old package: ${err.message}`)
  }
}

const rootPath = process.cwd()
const packageJsonFileName = 'package.json'
const packageJsonPath = path.resolve(rootPath, packageJsonFileName)
const distDirName = 'dist'
const distDirPath = path.resolve(rootPath, distDirName)
const i18nDirName = 'i18n'
const i18nDirPath = path.resolve(rootPath, i18nDirName)
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
const extensionJson = extractExtensionJson(packageJson)
const outputFileName = `${extensionJson.name}.zip`
const outputFilePath = path.resolve(rootPath, outputFileName)

const packDatas: PackData[] = [
  { type: 'content', name: packageJsonFileName, content: JSON.stringify(extensionJson, null, 2) },
  { type: 'path', name: distDirName, path: distDirPath },
  { type: 'path', name: i18nDirName, path: i18nDirPath },
]

deleteOldPackage(outputFilePath)
generateZip(packDatas, outputFilePath)
  .then(() => console.log('Successfully generated package!'))
  .catch((err) => console.error(`Failed to generate package: ${err.message}`))
