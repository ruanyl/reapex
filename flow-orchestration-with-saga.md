# Tutorial 3: Advanced Usage - Application Flow Orchestration with Saga

`redux-saga` is a great library not only good at handling application side effects such as asynchronous requests but also specialized in dealing with complex application flows.

> You can learn more about `redux-saga` from its official [documentation](https://redux-saga.js.org/docs/About)

We will run an example to demonstrate how we can use redux-saga to handle side effects with reapex.

Let's continue using the signup form we created earlier and add the following new features:

1. After signup successfully, log in the user automatically
2. Provide a `Cancel` button to allow the user to terminate the auto-login if they don't want to get logged in automatically

Let's start with creating a fake `login` function to simulate the login request

```typescript
async function login(username: string, password: string) {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 3000)
  })
}
```

And we will update the `signup` side effect from a promise-based implementation to saga implementation

```typescript
const [triggers] = userModel.triggers({
  signup: {
    *takeLeading(username: string, password: string) {
      const res = yield call(signup, username, password)
      if (res === true) {
        alert('Welcom ' + username)
      }
    },
  }
})
```

Here we converted the async/await function to a generator function(assume you have basic knowledge of redux-saga).

We added `status` state which indicates the current user login status to the user model.

After successfully signed-up, it will call `login` function and mark the user as logged in after `login` request returns. The `status` state has the initial value `LoggedOut` and it will become `Logging` when the `login` starts and set it to `LoggedIn` if successfully logged in.

```typescript
const initial = { username: '', password: '', valid: false, status: 'LoggedOut' }
const userModel = app.model('User', initial)

const [mutations] = userModel.mutations({
  // ...
  logout: () => state => ({...state, status: 'LoggedOut'}),
  logging: () => state => ({...state, status: 'Logging'}),
  loggedIn: () => state => ({...state, status: 'LoggedIn'}),
})

const [triggers] = userModel.triggers({
  signup: {
    *takeLeading(username: string, password: string) {
      const res = yield call(signup, username, password)
      
      if (res === true) {
        yield call(mutations.logging)
        const loggedIn = yield call(login, username, password)
        
        if (loggedIn) {
          yield call(mutations.loggedIn) 
        }
      }
    },
  },
})
```

Accordingly, let's update the UI to reflect the status. A `Cancel` button will be shown when login starts and when clicking the button it will terminate the login and reset status to `LoggedOut`

```typescript
export const SignUpForm = () => {
  const { username, password, valid, status } = useModel(userModel)

  return (
    <div>
      <input value={username} onChange={(e) => mutations.setUsername(e.target.value)} placeholder="username" />
      <input
        value={password}
        type="password"
        placeholder="password"
        onChange={(e) => mutations.setPassword(e.target.value)}
      />
      <button disabled={!valid} onClick={() => triggers.signup(username, password)}>
        Submit
      </button>
      {/* The Cancel button */}
      {status === 'Logging' && <button onClick={() => mutations.logout()}>Cancel</button>}
    </div>
  )
}
```

In order to achieve the above goals, we will need to monitor the `Cancel` button click and the `login` request at the same time, and if `Cancel` happened before `login` responded, ignore the `login`request and set user as `LoggedOut`

This is a typical race condition we usually face in FE development. If you're familiar with redux-saga, you will know that we can run a `race` effect on `Cancel` click and  `login` request like this:

```typescript
const [mutations, mutationTypes] = userModel.mutations({
  // ...
})

const [triggers] = userModel.triggers({
  signup: {
    *takeLeading(username: string, password: string) {
      const res: boolean = yield call(signup, username, password)
      
      if (res === true) {
        yield call(mutations.logging)
        // Race between cancel button click and login requst
        const {loggedIn, cancel} = yield race({
          loggedIn: call(login, username, password),
          cancel: take(mutationTypes.logout), 
        }) 
        
        if (cancel) {
          yield call(mutations.logout) 
        } else if (loggedIn) {
          yield call(mutations.loggedIn) 
        }
      }
    },
  },
})
```

{% hint style="info" %}
Please note the second parameter in the tuple returned by `mutations` function is the redux action types where we can use the parameter of redux-saga `take`
{% endhint %}

See the full example [here](https://codesandbox.io/s/user-sign-up-advanced-usage-tkxec?file=/src/index.tsx)

