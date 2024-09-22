// preinstall.js

if (!/yarn\.js$/.test(process.env.npm_execpath || '')) {
  console.error(`
    ⚠️  This project requires Yarn for package management. 
    Please use 'yarn install' instead of 'npm install'. 
    `)
  process.exit(1) // 退出进程，防止安装继续
}
