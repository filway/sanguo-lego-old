/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
declare module "jquery"


import { Router } from '@/routes/index'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $router: Router
  }
}
