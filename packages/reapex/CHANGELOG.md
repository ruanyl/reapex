# release 1.1.0

### Bug Fix

1. Now when calling `store.getState` or `store.dispatch` internally, the store will be created if no store was initialized

# release 1.0.0-beta.2

### New features

1. Support both a plain object as the model state
It only supports Immutable Record before, now with plain support, users can choose immutability tools such as immer.

2. Started to support plugin which intercepts the reducer/action lifecycle and enables people to extend the framework via the plugin.
For example, immer supports via plugin: [reapex-plugin-immer](https://www.npmjs.com/package/reapex-plugin-immer)

### Breaking changes
1. The initial state passed to `app.model` will not be converted to Immutable Record, it will be the same type as the data passed in.
`app.model` accepts both the plain object and Immutable Record as initial state and the `state` it receives in `model.mutations` will be either plain object or Immutable Record based on the type of initial state.

For example:
```typescript
const app = new App()
const model = app.model('counter', { total: 0 })
const [mutations] = model.mutations({
  // state here will be a plain object
  increase: () => state => ({total: state.total + 1}),
})
```
With Immutable Record:
```typescript
const app = new App()
const CounterState = Immutable.Record({{ total: 0 }})
const initialState = new CounterState()
const model = app.model('counter', initialState)

const [mutations] = model.mutations({
  // state here will be an Immutable Record
  increase: () => state => state.set('total', state.total + 1),
})
```

# release 0.12.0

### Breaking change

Removed `actionTypeDelimiter` from App constructor, this will enforce to use `/` as action type delimiter

### New feature

The `effects()` trigger map now support `throttle`, `debounce` and `takeLeading`

1. `takeLeading` example of only do fetching user once in one time
```typescript
const [effects] = model.effects({}, {
  requestUser: {
    *takeLeading() {
      yield call(API.getUser)
    }
  }
})
```

2. `debounce` example of decreasing the rate of validation function call when input changes
```typescript
const [effects] = model.effects({}, {
  handleInputChange: {
    *debounce(input) {
      yield call(validate, input)
    },
    ms: 500,
  }
})
```

3. `throttle` example of limiting the API calls of requesting suggestions on input changes
```typescript
const [effects] = model.effects({}, {
  requestSuggestions: {
    *throttle(input) {
      yield call(API.findSuggestions, input)
    },
    ms: 1000,
  }
})
```



# release 0.10.0

### Breaking change

Removed reducers and sagas from App config which passed into the App
constructor when App is initialized.

This causes issues when migrating existing react/redux application to
use Reapex. There will be circulation import issue if the existing
application has references to Reapex created model

To register existing sagas and reducers, use:
app.runSaga()
app.setExternalReducers()

### New feature

Reapex by default creates action type with `/` separated strings internally.
For example: 'SomeModelName/MutationName'. When Reapex binding action types to sagas by the calling `effect(effectMap)`, it will
check if the `effectMap` key has a namespace(e.g. `SomeModelName`) and it will prefix the key with a namespace when binding sagas
if no namespace presents.  This is archived by splitting the key by `/`

However, when migrating existing react/redux application to use Reapex, the action types of existing application could be in any pattern,
for example, `.` or `_` separated, or even just a random string.

For Reapex to recognize such action types when binding actions to sagas, now it allows to pass App config like this:
```typescript
const app = new App({
  actionTypeHasNamespace: (actionType: string) => actionType.includes('.')
})
```
