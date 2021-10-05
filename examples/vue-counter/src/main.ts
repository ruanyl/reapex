import Root from "./Root.vue";
import { createApp } from "vue";
import { app as reapexApp } from "./app";
import reapexPlugin from "reapex-vue";

const app = createApp(Root);

app.use(reapexPlugin, reapexApp).mount("#app");
