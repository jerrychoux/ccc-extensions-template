**English** | [中文](./README.zh-CN.md)

# Project Overview

A basic Cocos Creator project containing essential configurations for plugin development.

## Development Environment

Cocos Creator

## Installation

```bash
# Import the project using the latest version of Cocos Creator
Import the project
# Open the project directory in the terminal
Open the project directory
# Modify the plugin name to a custom one
yarn run replaceExtensionName --name new-extension-name
# Navigate to the plugin template directory
cd .\extensions\new-extension-name\
# Build the extension
yarn run build
# Package the extension
yarn run packaging
```

## Usage

Once the extension is enabled, click on `Panel -> new-extension-name -> Default Panel` in the main menu bar to open the default panel of the extension.

Click on `Developer -> new-extension-name -> Send Message to Panel` in the top menu to send a message to the default panel. If the default panel is open, it will call the panel's `hello` method.

After clicking `Send Message to Panel`, a message `send-to-panel` will be sent to the extension as defined in `contributions.menu` within `package.json`. According to the definition in `contributions.messages` within `package.json`, when the extension receives the `send-to-panel` message, the `default` panel will invoke the `hello` method.
