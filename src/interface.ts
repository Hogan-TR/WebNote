export interface Selected {
  selection: Selection
  text: string
  bottom: number
  left: number
}

export interface StorageService<T> {
  get(key: string): Promise<T | undefined>
  set(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
  getAll?(): Promise<{ [key: string]: T }>
  clear?(): Promise<void>
}
