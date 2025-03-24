import * as esbuild from "esbuild";
import * as fs from "fs";
import * as terser from "terser";
import path from "path";
import javascriptObfuscator from "javascript-obfuscator";
import chalk from "chalk";

// 入口文件配置
const entryPoints = [
  { path: "./src/replaceExtensionName.ts", compress: false, obfuscate: false },
];

// 检查文件是否需要重新构建
const shouldRebuild = (srcPath, distPath) => {
  // 如果 dist 文件不存在，则需要构建
  if (!fs.existsSync(distPath)) return true;

  // 获取 src 和 dist 文件的最后修改时间
  const srcStats = fs.statSync(srcPath);
  const distStats = fs.statSync(distPath);

  // 如果 src 文件比 dist 文件新，则需要构建
  return srcStats.mtimeMs > distStats.mtimeMs;
};

// 检查是否需要构建
const needsBuild = entryPoints.some((entry) => {
  const srcPath = entry.path;
  const distPath = path.join("./dist", path.basename(srcPath, ".ts") + ".cjs");
  return shouldRebuild(srcPath, distPath);
});

// Terser 压缩配置
const terserConfig = {
  compress: { drop_console: true, drop_debugger: true },
  format: { comments: false },
};

const getTerserConfig = (entry) =>
  typeof entry.compress === "object" ? entry.compress : terserConfig;

// 内存存储中间结果
const processedFiles = new Map();

// 查找对应的入口文件配置
const findEntryConfig = (outputPath) =>
  entryPoints.find((entry) =>
    outputPath.endsWith(path.basename(entry.path, ".js") + ".cjs")
  );

// Terser 压缩插件
const terserPlugin = {
  name: "terser-plugin",
  setup(build) {
    build.onEnd(async (result) => {
      for (const outputFile of result.outputFiles || []) {
        if (!outputFile.path.endsWith(".cjs")) continue;

        const entry = findEntryConfig(outputFile.path);
        if (!entry || !entry.compress) continue;

        try {
          const code = processedFiles.get(outputFile.path) || outputFile.text;
          const minified = await terser.minify(code, getTerserConfig(entry));

          if (minified.error) {
            throw new Error(`Terser minification failed: ${minified.error}`);
          }

          // 存储压缩后的代码
          processedFiles.set(outputFile.path, minified.code);
          console.log(`Compressed: ${outputFile.path}`);
        } catch (err) {
          throw new Error(err.message);
        }
      }
    });
  },
};

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
  identifierNamesGenerator: "mangled", // 使用短变量名
};

// JavaScript Obfuscator 混淆插件
const obfuscationPlugin = {
  name: "obfuscation-plugin",
  setup(build) {
    build.onEnd((result) => {
      for (const outputFile of result.outputFiles || []) {
        if (!outputFile.path.endsWith(".cjs")) continue;

        const entry = findEntryConfig(outputFile.path);
        if (!entry || !entry.obfuscate) continue;

        try {
          const code = processedFiles.get(outputFile.path) || outputFile.text;
          const obfuscatedCode = javascriptObfuscator
            .obfuscate(code, obfuscationConfig)
            .getObfuscatedCode();

          // 存储混淆后的代码
          processedFiles.set(outputFile.path, obfuscatedCode);
          console.log(`Obfuscated: ${outputFile.path}`);
        } catch (err) {
          throw new Error(
            `Obfuscation failed for ${outputFile.path}: ${err.message}`
          );
        }
      }
    });
  },
};

// 文件写入插件
const writeFilePlugin = {
  name: "write-file-plugin",
  setup(build) {
    build.onEnd((result) => {
      for (const outputFile of result.outputFiles || []) {
        if (!outputFile.path.endsWith(".cjs")) continue;

        try {
          const finalCode =
            processedFiles.get(outputFile.path) || outputFile.text;
          fs.mkdirSync(path.dirname(outputFile.path), { recursive: true });
          fs.writeFileSync(outputFile.path, finalCode);
        } catch (err) {
          throw new Error(
            `Failed to write file ${outputFile.path}: ${err.message}`
          );
        }
      }
    });
  },
};

// 如果需要构建，则执行 esbuild
if (needsBuild) {
  const baseCommand = `yarn run build`;
  process.stdout.write(`[?] ${baseCommand}`);

  esbuild
    .build({
      entryPoints: entryPoints.map((entry) => entry.path), // 提取路径作为输入文件
      outdir: "./dist", // 输出目录
      bundle: false, // 打包所有依赖
      minify: true, // 启用压缩
      platform: "node", // Node.js 平台
      target: "node14", // 目标为 Node.js 14
      format: "cjs", // 输出 CommonJS 格式
      write: false, // 不自动写文件，交由插件处理
      outExtension: { ".js": ".cjs" }, // 将 .js 文件扩展名替换为 .cjs
      plugins: [terserPlugin, obfuscationPlugin, writeFilePlugin],
    })
    .then(() => {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      console.log(chalk.greenBright(`[√] ${baseCommand}`));
    })
    .catch((error) => {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      console.log(chalk.redBright(`[x] ${baseCommand}`));
      console.error(error.message);
    });
}
