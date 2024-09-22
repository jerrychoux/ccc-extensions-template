// preinstall.js
if (!/yarn\.js$/.test(process.env.npm_execpath || '')) {
    console.error("\n    \u26A0\uFE0F  This project requires Yarn for package management. \n    Please use 'yarn install' instead of 'npm install'. \n    ");
    process.exit(1); // 退出进程，防止安装继续
}
