# Side Effects with debounce

`throttle` maybe still a bit too much, probably we just want to make the remote request only after the user stops typing.

We can optimize this by running a debounce effect on `setUsername` mutation which only calls the `validateUsername` function after the user stops typing for a period of time.

```typescript
userModel.effects({
  setUsername: {
    async debounce({ payload }: ReturnType<typeof mutations.setUsername>) {
      const [username] = payload
      const valid = await validateUsername(username)
      mutations.setValid(valid)
    },
    ms: 1000,
  }
})
```

In the above example, we configured a side effect for `setUsername` mutation that only will be run after the user stops typing for 1000ms.

See the full example [here](https://codesandbox.io/s/user-sign-up-async-effects-debounce-gr3ve?file=/src/index.tsx)
