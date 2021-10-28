### Reapex local storage plugin
Easily persist and restore data between state and local storage

![image](https://user-images.githubusercontent.com/486382/139324424-924a3b72-c30a-4a30-9adf-0308420159c5.gif)


```typescript
import { App } from 'reapex'
import createLocalStoragePlugin from 'reapex-plugin-local-storage'

// 1. Initialize the plugin
const { plugin, persist } = createLocalStoragePlugin()
const app = new App()

// 2. register the plugin
app.plugin(plugin)

// 3. Simply wrap a `model` with `persist`
const UserModel = app.model('User', { name: '', age: 0 })
persist(UserModel)

```
