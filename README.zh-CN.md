[English](./README.md) | **中文**

# 项目简介

包含插件开发基本配置的 Cocos Creator 基础项目。

## 开发环境

Cocos Creator

## 安装

```bash
# 使用Cocos Creator最新版本导入项目
导入项目
# 使用终端打开项目目录
打开项目目录
# 修改插件名称为自定义
yarn run replaceExtensionName --name new-extension-name
# 进入插件模板目录
cd .\extensions\new-extension-name\
# 构建
yarn run build
# 打包
yarn run packaging
```

## 用法

启用扩展后，点击主菜单栏中的 `面板 -> new-extension-name -> 默认面板`，即可打开扩展的默认面板。

依次点击顶部菜单的 `开发者 -> new-extension-name -> 发送消息给面板` 即可发送消息给默认面板，如果此时存在默认面板，将会调用面板的 `hello` 方法。

点击 `发送消息给面板` 后，根据 `package.json` 中 `contributions.menu` 的定义将发送一条消息 `send-to-panel` 给扩展。根据 `package.json` 中 `contributions.messages` 的定义当扩展收到 `send-to-panel` 后将会使 `default` 面板调用 `hello` 方法。
