export async function delay(timeout: number = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(timeout)
    }, timeout)
  })
}
