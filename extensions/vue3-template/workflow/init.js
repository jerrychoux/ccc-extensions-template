import { existsSync } from 'fs'
import { execSync } from 'child_process'
import { resolve } from 'path'

// 定义要检查的目录数组（当前目录和上一级目录）
const directoriesToCheck = ['.', '..']

directoriesToCheck.forEach((dir) => {
  const absolutePath = resolve(dir) // 获取目录的绝对路径
  const nodeModulesPath = resolve(absolutePath, 'node_modules') // 拼接 node_modules 的完整路径

  // 检查 node_modules 是否存在
  if (!existsSync(nodeModulesPath)) {
    console.log('正在安装依赖...')
    execSync('yarn install', { stdio: 'inherit', cwd: absolutePath }) // 在指定目录执行 yarn install
  }
})
