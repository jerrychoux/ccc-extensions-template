"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const archiver_1 = __importDefault(require("archiver"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
function createExtensionJson(data = {}) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return {
        package_version: (_a = data.package_version) !== null && _a !== void 0 ? _a : '1.0.0',
        name: (_b = data.name) !== null && _b !== void 0 ? _b : 'Default Extension',
        version: (_c = data.version) !== null && _c !== void 0 ? _c : '1.0.0',
        author: (_d = data.author) !== null && _d !== void 0 ? _d : 'Unknown',
        editor: (_e = data.editor) !== null && _e !== void 0 ? _e : 'Unknown',
        description: (_f = data.description) !== null && _f !== void 0 ? _f : 'No description provided.',
        main: (_g = data.main) !== null && _g !== void 0 ? _g : 'index.js',
        panels: (_h = data.panels) !== null && _h !== void 0 ? _h : {},
        contributions: (_j = data.contributions) !== null && _j !== void 0 ? _j : {},
    };
}
function extractExtensionJson(obj) {
    const result = {};
    const extensionInstance = createExtensionJson();
    const keys = Object.keys(extensionInstance);
    keys.forEach((key) => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
}
function generateZip(datas, filePath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(filePath);
        const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
        output.on('close', () => resolve());
        archive.on('warning', (err) => err.code !== 'ENOENT' && reject(err));
        archive.on('error', (err) => reject(err));
        for (const data of datas) {
            const { type, path, name, content } = data;
            if (type === 'content') {
                if (!content || !name) {
                    console.error(`Invalid path or context.`);
                    continue;
                }
                archive.append(content, { name });
            }
            else {
                if (path && !fs.existsSync(path)) {
                    console.error(`Path does not exist: ${path}`);
                    continue;
                }
                const states = fs.statSync(path);
                if (states.isDirectory()) {
                    archive.directory(path, name !== null && name !== void 0 ? name : false);
                }
                else {
                }
            }
        }
        archive.pipe(output);
        archive.finalize();
    });
}
const rootPath = process.cwd();
const packageJsonFileName = 'package.json';
const packageJsonPath = path.resolve(rootPath, packageJsonFileName);
const distDirName = 'dist';
const distDirPath = path.resolve(rootPath, distDirName);
const i18nDirName = 'i18n';
const i18nDirPath = path.resolve(rootPath, i18nDirName);
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const extensionJson = extractExtensionJson(packageJson);
const outputFileName = `${extensionJson.name}.zip`;
const outputFilePath = path.resolve(rootPath, outputFileName);
const formattedJsonString = JSON.stringify(extensionJson, null, 2);
const packDatas = [
    { type: 'content', name: packageJsonFileName, content: formattedJsonString },
    { type: 'path', name: distDirName, path: distDirPath },
    { type: 'path', name: i18nDirName, path: i18nDirPath },
];
generateZip(packDatas, outputFilePath);
