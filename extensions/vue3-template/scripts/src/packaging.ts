import archiver from 'archiver'
import * as fs from 'fs-extra'
import * as path from 'path'

type Prod = 'full' | 'free'
const isFree = (prod: Prod) => prod === 'free'

interface ExtensionJson {
  package_version: string
  name: string
  version: string
  author: string
  editor: string
  description: string
  main: string
  panels: {}
  contributions: {
    menu?: Array<{ path: string; label: string; message: string }>
  }
}

function createExtensionJson(data: Record<string, any> = {}): ExtensionJson {
  const extensionJson = data as ExtensionJson
  return {
    package_version: extensionJson.package_version ?? '1.0.0',
    name: extensionJson.name ?? 'Default Extension',
    version: extensionJson.version ?? '1.0.0',
    author: extensionJson.author ?? 'Unknown',
    editor: extensionJson.editor ?? 'Unknown',
    description: extensionJson.description ?? 'No description provided.',
    main: extensionJson.main ?? 'index.js',
    panels: extensionJson.panels ?? {},
    contributions: extensionJson.contributions ?? {},
  }
}

function extractExtensionJson(obj: Record<string, any>, prod: Prod = 'full'): ExtensionJson {
  const extensionJson = createExtensionJson(obj)

  if (isFree(prod)) {
    const searchValue = extensionJson.name
    const replaceValue = `${extensionJson.name}-free`

    extensionJson.name = replaceValue
    extensionJson.description = extensionJson.description.replace(searchValue, replaceValue)

    for (const key in extensionJson.panels) {
      if (extensionJson.panels.hasOwnProperty(key)) {
        extensionJson.panels[key].title = extensionJson.panels[key].title.replace(searchValue, replaceValue)
      }
    }

    extensionJson.contributions.menu?.forEach((item) => {
      item.path = item.path.replace(searchValue, replaceValue)
      item.label = item.label.replace(searchValue, replaceValue)

      // editor_menu_free
      item.path = item.path.replace('editor_menu', 'editor_menu_free')
    })
  }

  return extensionJson
}

interface PackData {
  type: 'path' | 'content'
  path?: string
  name?: string
  content?: string
}

function generateZip(datas: PackData[], filePath: string) {
  return new Promise<void>((resolve, reject) => {
    const outputDir = path.dirname(filePath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirpSync(outputDir)
    }

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

const getCustomParamValue = <T>(key: string): T | undefined => {
  const argv = process.argv
  const index = argv.indexOf(`--${key}`)
  return index !== -1 ? (argv[index + 1] as T) : undefined
}

const prod = getCustomParamValue<Prod>('prod') ?? 'full'
const rootPath = process.cwd()
const packageJsonFileName = 'package.json'
const packageJsonPath = path.resolve(rootPath, packageJsonFileName)
const distDirName = 'dist'
const distDirPath = path.resolve(rootPath, distDirName)
const i18nDirName = 'i18n'
const i18nDirPath = path.resolve(rootPath, i18nDirName)
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
const extensionJson = extractExtensionJson(packageJson, prod)
const outputFileName = `${extensionJson.name}.zip`
const outputFilePath = path.resolve(rootPath, 'publish', outputFileName)

const packDatas: PackData[] = [
  { type: 'content', name: packageJsonFileName, content: JSON.stringify(extensionJson, null, 2) },
  { type: 'path', name: distDirName, path: distDirPath },
  { type: 'path', name: i18nDirName, path: i18nDirPath },
]

deleteOldPackage(outputFilePath)
generateZip(packDatas, outputFilePath)
  .then(() => console.log('Successfully generated package!'))
  .catch((err) => console.error(`Failed to generate package: ${err.message}`))
