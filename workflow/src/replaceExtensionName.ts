import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import * as fs from 'fs'
import * as path from 'path'

const argv = yargs(hideBin(process.argv))
  .option('name', {
    type: 'string',
    description: 'The new extension name',
  })
  .demandOption('name', 'Please provide the "name" argument')
  .parseSync()

const oldExtensionName = 'vue3-template'
const newExtensionName = argv.name ?? oldExtensionName

const oldExtensionTitle = convertToExtensionTitle(oldExtensionName)
const newExtensionTitle = convertToExtensionTitle(newExtensionName)

function convertToExtensionTitle(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// 通用的文件读取、替换和写入逻辑
async function readReplaceWrite(filePath: string, replacements: [RegExp, string][]): Promise<void> {
  try {
    const data = await fs.promises.readFile(filePath, 'utf-8')
    let result = data

    // 替换所有的内容
    for (const [regex, replacement] of replacements) {
      result = result.replace(regex, replacement)
    }

    if (result !== data) {
      await fs.promises.writeFile(filePath, result, 'utf-8')
      console.log(`Updated: ${filePath}`)
    }
  } catch (err) {
    console.error(`Error processing file: ${filePath}`, err)
    throw err
  }
}

// 处理 package.json 文件
async function parsePackageJson(): Promise<void> {
  const packageJsonPath = path.resolve(__dirname, `../../extensions/${oldExtensionName}/package.json`)
  await readReplaceWrite(packageJsonPath, [[new RegExp(oldExtensionName, 'g'), newExtensionName]])
}

// 处理 README.md 和 README.zh-CN.md 文件
async function parseReadmeFiles(): Promise<void> {
  const readmePaths = [
    path.resolve(__dirname, `../../extensions/${oldExtensionName}/README.md`),
    path.resolve(__dirname, `../../extensions/${oldExtensionName}/README.zh-CN.md`),
  ]

  const promises = readmePaths.map((filePath) =>
    readReplaceWrite(filePath, [[new RegExp(oldExtensionName, 'g'), newExtensionName]])
  )

  await Promise.all(promises)
}

// 处理 i18n 相关文件
async function parseI18nRelatedFiles(): Promise<void> {
  const i18nDir = path.resolve(__dirname, `../../extensions/${oldExtensionName}/i18n`)
  const srcDir = path.resolve(__dirname, `../../extensions/${oldExtensionName}/src`)

  // 递归替换目录下的文件
  async function replaceInFiles(dir: string, regex: RegExp, replacement: string): Promise<void> {
    const files = await fs.promises.readdir(dir)
    const filePromises = files.map(async (file) => {
      const filePath = path.join(dir, file)
      const stats = await fs.promises.stat(filePath)

      if (stats.isDirectory()) {
        return replaceInFiles(filePath, regex, replacement) // 递归处理子目录
      } else if (stats.isFile() && file.endsWith('.ts')) {
        return readReplaceWrite(filePath, [[regex, replacement]])
      }
    })

    await Promise.all(filePromises)
  }

  // 处理 i18n 文件夹
  const i18nFiles = await fs.promises.readdir(i18nDir)
  const i18nPromises = i18nFiles.map((file) =>
    readReplaceWrite(path.join(i18nDir, file), [[new RegExp(oldExtensionTitle, 'g'), newExtensionTitle]])
  )

  // 处理 src 文件夹
  await Promise.all(i18nPromises)
  await replaceInFiles(srcDir, new RegExp('i18n:' + oldExtensionName, 'g'), 'i18n:' + newExtensionName)
}

// 重命名文件夹
async function renameFolder(): Promise<void> {
  const oldFolderPath = path.resolve(__dirname, `../../extensions/${oldExtensionName}`)
  const newFolderPath = path.resolve(__dirname, `../../extensions/${newExtensionName}`)

  try {
    await fs.promises.rename(oldFolderPath, newFolderPath)
    console.log(`Successfully renamed folder: ${oldExtensionName} -> ${newExtensionName}`)
  } catch (err) {
    console.error(`Failed to rename folder: ${oldExtensionName} -> ${newExtensionName}`, err)
    throw err
  }
}

// 处理所有替换任务
async function replaceExtensionName() {
  try {
    await parsePackageJson()
    console.log('Package.json updated successfully.')

    await parseReadmeFiles()
    console.log('All README files updated successfully.')

    await parseI18nRelatedFiles()
    console.log('All i18n files updated successfully.')

    await renameFolder()
    console.log('Rename Folder successfully.')
  } catch (err) {
    console.error('Error during extension renaming process:', err)
  }
}

replaceExtensionName()
