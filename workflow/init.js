import { existsSync } from 'fs'
import { execSync } from 'child_process'

// 检查 node_modules 是否存在
if (!existsSync('node_modules')) {
  console.log('正在安装依赖...')
  execSync('yarn install', { stdio: 'inherit' })
}
