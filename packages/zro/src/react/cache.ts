type CacheItem<T> = {
  data: T
  timestamp: number
  isRevalidating?: boolean
}

export class Cache {
  private cache: Map<string, CacheItem<any>> = new Map()
  private revalidateCallbacks: Map<string, (key: string) => Promise<any>> = new Map()

  set<T>(key: string, data: T) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      isRevalidating: false,
    })
    return data
  }

  setRevalidateCallback(key: string, callback: (key: string) => Promise<any>): void {
    this.revalidateCallbacks.set(key, callback)
  }
  getRevalidateCallback(key: string) {
    return this.revalidateCallbacks.get(key)
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    // Trigger background revalidation if not already revalidating
    if (!item.isRevalidating) {
      const callback = this.revalidateCallbacks.get(key)
      if (callback) {
        item.isRevalidating = true
        this.set(
          key,
          callback(key).finally(() => {
            if (item) item.isRevalidating = false
          }),
        )
      }
    }

    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
    this.revalidateCallbacks.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.revalidateCallbacks.clear()
  }
}
