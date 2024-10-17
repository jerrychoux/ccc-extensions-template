import '../../utils/logger'
import { AssetInfo } from '@cocos/creator-types/editor/packages/asset-db/@types/public'

export function onCreateMenu(assetInfo: AssetInfo) {
  return [
    {
      label: 'i18n:vue3-template.menu_create_asset',
      click: () => {
        if (!assetInfo) {
          log('get create command from header menu')
        } else {
          log('get create command, the detail of diretory asset is:')
        }
      },
    },
  ]
}

export function onAssetMenu(assetInfo: AssetInfo) {
  return [
    {
      label: 'i18n:vue3-template.menu_asset_command_parent',
      submenu: [
        {
          label: 'i18n:vue3-template.menu_asset_command_1',
          enabled: assetInfo.isDirectory,
          click() {
            log('get it')
          },
        },
        {
          label: 'i18n:vue3-template.menu_asset_command_2',
          enabled: !assetInfo.isDirectory,
          click() {
            log('yes, you clicked')
          },
        },
      ],
    },
  ]
}

export function onDBMenu(assetInfo: AssetInfo) {
  return [
    {
      label: 'i18n:vue3-template.menu_db_command_1',
      click() {
        console.log(`db command 1 from ${assetInfo.name}`)
      },
    },
    {
      label: 'i18n:vue3-template.menu_db_command_2',
      click() {
        console.log(`db command 2 from ${assetInfo.name}`)
      },
    },
  ]
}

export function onPanelMenu(assetInfo: AssetInfo) {
  return [
    {
      label: 'i18n:vue3-template.menu_panel_command_1',
      click() {
        console.log(`clicked on the plain area of the panel. No asset, 'assetInfo' is ${assetInfo}`)
      },
    },
  ]
}
