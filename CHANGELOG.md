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
