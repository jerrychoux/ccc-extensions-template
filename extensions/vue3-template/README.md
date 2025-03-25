# Project Title

An extension that shows how to open and communicate with the panel through messages and menus.
The panel is based on Vue3.x.

## Development Environment

Node.js

## Install

```bash
# Build the extension
yarn run build
# Package the extension
yarn run packaging
```

## Usage

After enabling the extension, click `Panel -> vue3-template -> Default Panel` in the main menu bar to open the default panel of the extension.

To send a message to the default panel, click `Developer -> vue3-template -> Send Message to Panel` at the top of the menu. If the default panel exists, the `hello` method of the panel will be called.

After clicking `Send Message to Panel`, a message `send-to-panel` will be sent to the extension as defined by `contributions.menu` in `package.json`. When the extension receives the `send-to-panel` message, it will cause the `default` panel to call the `hello` method as defined by `contributions.messages` in `package.json`.
