/// <reference types="vite/client" />
declare module '*.vue' {
    import { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module '*.css' {
    const css: {[key: string]: string}
    export default css
}

declare module '*.scss' {
    const scss: {[key: string]: string}
    export default scss
}

declare module '*.sass' {
    const sass: {[key: string]: string}
    export default sass
}

declare module '*.less' {
    const less: {[key: string]: string}
    export default less
}

declare module '*.txt' {
    const txt: string
    export default txt
}

declare module '*.json' {
    const json: {[key: string]: any}
    export default json
}

declare module '*.jpg' {
    const jpg: string
    export default jpg
}

declare module '*.jpeg' {
    const jpeg: string
    export default jpeg
}

declare module '*.png' {
    const png: string
    export default png
}

declare module '*.gif' {
    const gif: string
    export default gif
}
