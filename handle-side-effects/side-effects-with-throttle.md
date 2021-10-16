# Side Effects with throttle

In the previous example, the `validateUsername` function is called whenever the username input changes on each user typing. This will end up with an unnecessary amount of remote requests. If you don't want to flood your server, you probably want to throttle the requests.

We can achieve this by running a `throttle` effect on `setUsername` mutation which only calls the `validateUsername` function with a max frequency, for example, one request per second.

```typescript
userModel.effects({
  setUsername: {
    async throttle({ payload }: ReturnType<typeof mutations.setUsername>) {
      const [username] = payload
      const valid = await validateUsername(username)
      mutations.setValid(valid)
    },
    ms: 1000,
  }
})
```

Instead of configuring a side effect with a function, we can configure it as an object which has keys `throttle` and `ms` where the `throttle` will be only be run max one time in 1000 ms, any `setUsername` mutations happening during the 1000 ms will be ignored if there was already a `throttle` effect running.

See the full example [here](https://codesandbox.io/s/user-sign-up-async-effects-throttle-6qt9c?file=/src/index.tsx)
