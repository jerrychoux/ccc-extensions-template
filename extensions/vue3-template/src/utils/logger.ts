const isDev = () => __EXTENSION_MODE__ === 'development'

export const log = (message: string, ...args: any[]) => {
  isDev() && console.log(`[${__EXTENSION_NAME__}]: ${message}`, ...args)
}

export const info = (message: string, ...args: any[]) => {
  isDev() && console.info(`[${__EXTENSION_NAME__}]: ${message}`, ...args)
}

export const warn = (message: string, ...args: any[]) => {
  isDev() && console.warn(`[${__EXTENSION_NAME__}]: ${message}`, ...args)
}

export const error = (message: string, ...args: any[]) => {
  isDev() && console.error(`[${__EXTENSION_NAME__}]: ${message}`, ...args)
}

export default (() => {
  ;(globalThis as any).log = log
  ;(globalThis as any).info = info
  ;(globalThis as any).warn = warn
  ;(globalThis as any).error = error
})()
