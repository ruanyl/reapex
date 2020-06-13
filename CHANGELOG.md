# release 0.12.0

### Breaking change

Removed `actionTypeDelimiter` from App constructor, this will enforce to use `/` as action type delimiter

### New feature

The `effects()` trigger map now support `throttle`, `debounce` and `takeLeading`

1. `takeLeading` example of only do fetching user once in one time
```
const [effects] = model.effects({}, {
  requestUser: {
    *takeLeading() {
      yield call(API.getUser)
    }
  }
})
```

2. `debounce` example of decreasing the rate of validation function call when input changes
```
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
```
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
```
const app = new App({
  actionTypeHasNamespace: (actionType: string) => actionType.includes('.')
})
```
