import reapexPlugin from 'reapex-vue'
import { createApp } from 'vue'

import Root from './Root.vue'
import { app as reapexApp } from './app'

const app = createApp(Root)

app.use(reapexPlugin, reapexApp).mount('#app')
