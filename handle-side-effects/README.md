# Tutorial 2: Handle Side Effects

For a sign-up form, we might want to call an API to validate the username while the user typing.

First, let's create a fake username validation function to simulate the async request.

```typescript
async function validateUsername(username: string) {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      resolve(!username.includes('test'))
    }, 1000) // assume the api request takes 1000ms to response
  })
}
```

Then we will add a `valid` state to the user model and add mutation accordingly

```typescript
const userModel = app.model('User', { username: '', password: '', valid: false })

const [mutations] = userModel.mutations({
  ...
  // Added this mutation to update `valid` state
  setValid: (valid: boolean) => (state) => ({ ...state, valid }),
})

export const SignUpForm = () => {
  ...
  // Read `valid` and set Submit button to disabled if `valid` is false
  const {valid} = useModel(userModel)

  return (
    <div>
      ...
      <button disabled={!valid}>Submit</button>
    </div>
  )
}
```

To call remote API on each `setUsername` mutation, we need to define a side-effect for it:

```typescript
userModel.effects({
  async setUsername({ payload }: ReturnType<typeof mutations.setUsername>) {
    const [username] = action.payload
    const valid = await validateUsername(username)
    mutations.setValid(valid)
  },
})
```

{% hint style="info" %}
Please note in the above example how it retrieves the payload of a mutation.
{% endhint %}

The side-effect function will run on every `mutations.setUsername`and it will call the async function to validate username and update `valid` state accordingly.

See the full running example [here](https://codesandbox.io/s/user-sign-up-async-effects-eek6h)



