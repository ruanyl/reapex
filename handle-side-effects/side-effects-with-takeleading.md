# Side Effects with takeLeading

Now we have a user sign-up form, next step let's submit the form and get the user register.

First, let's create a fake function to simulate the signup request.

```typescript
async function signup(username: string, password: string) {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 1000)
  })
}
```

You may simply add an `onClick`callback on submit button:

```typescript
<button onClick={() => signup(username, password)}>Submit</button>
```

But sooner you will find that the user may click submit button multiple times. You can add a state(flag) the first time the user click submit button and prevent further clicks before the signup function complete.

Here we will introduce another approach of how we use reapex to handle this. Similar to mutations side effects, we can define side effects for any UI events. These non-mutation side effects are called `triggers`

```typescript
const [triggers] = userModel.triggers({
  signup: {
    async takeLeading(username: string, password: string) {
      const res = await signup(username, password)
      if (res === true) {
        alert('Welcom ' + username)
      }
    },
  }
})
```

```typescript
<button onClick={() => triggers.signup(username, password)}>Submit</button>
```

In the example above, we defined a side effect called `signup` which only gets triggered when it's called specifically. Like in the example, it calls the `signup` side effect when clicking on the submit button. However, it only takes the first onClick event(with `takeLeading`) and ignores all the further clicks before the side effect finished.

See the full example [here](https://codesandbox.io/s/user-sign-up-async-effects-triggers-takeleading-2hcmi)

{% hint style="info" %}
You can use `throttle, debounce` or `takeLeading` on any side effects you created with  `effects`or `triggers`
{% endhint %}

