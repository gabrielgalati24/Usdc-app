/// <reference types="vite/client" />

// Declaraciones de módulos para importaciones de CSS
declare module '*.css' {
    const content: Record<string, string>
    export default content
}

// Declaraciones de módulos para importaciones de imágenes
declare module '*.svg' {
    const content: string
    export default content
}

declare module '*.png' {
    const content: string
    export default content
}

declare module '*.jpg' {
    const content: string
    export default content
}

declare module '*.jpeg' {
    const content: string
    export default content
}

declare module '*.gif' {
    const content: string
    export default content
}

declare module '*.webp' {
    const content: string
    export default content
}
