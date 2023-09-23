import { StorageService } from '../interface'

type storageType = 'local' | 'sync' | 'session'

class ChromeStorage<T> implements StorageService<T> {
  private storageType: storageType

  constructor(storageType: storageType) {
    this.storageType = storageType
  }

  async get(key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      chrome.storage[this.storageType].get([key], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(result[key])
        }
      })
    })
  }

  async set(key: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage[this.storageType].set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve()
        }
      })
    })
  }

  async remove(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage[this.storageType].remove([key], () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve()
        }
      })
    })
  }

  async getAll(): Promise<{ [key: string]: T }> {
    return new Promise((resolve, reject) => {
      chrome.storage[this.storageType].get(null, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(result as { [key: string]: T })
        }
      })
    })
  }

  async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage[this.storageType].clear(() => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve()
        }
      })
    })
  }
}

export default ChromeStorage
