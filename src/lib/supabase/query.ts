export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Request timed out after ${ms}ms`)
    this.name = "TimeoutError"
  }
}

export function withTimeout<T>(promise: Promise<T>, ms?: number): Promise<T>
export function withTimeout<T>(promise: PromiseLike<T>, ms?: number): Promise<T>
export function withTimeout<T>(promise: Promise<T> | PromiseLike<T>, ms: number = 15000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  return new Promise<T>((resolve, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(ms)), ms)
    Promise.resolve(promise).then(
      (val) => { clearTimeout(timer); resolve(val) },
      (err) => { clearTimeout(timer); reject(err) }
    )
  })
}
