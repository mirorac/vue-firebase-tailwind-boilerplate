declare module '*.vue' {
  import { DefineComponent } from 'vue'
  export interface GlobalComponents {
    // add global components here
  }
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMeta {
  env: {
    __APP_VERSION__: string
  }
}
