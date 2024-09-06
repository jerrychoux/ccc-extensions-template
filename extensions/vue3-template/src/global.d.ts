// src/globals.d.ts
declare const __EXTENSION_MODE__: 'development' | 'production'
declare const __EXTENSION_VERSION__: string
declare const __EXTENSION_NAME__: string

declare const log: (message: string, ...args: any[]) => void
declare const info: (message: string, ...args: any[]) => void
declare const warn: (message: string, ...args: any[]) => void
declare const error: (message: string, ...args: any[]) => void
