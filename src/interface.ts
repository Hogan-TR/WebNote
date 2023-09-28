// storage operator
export interface StorageService<T> {
  get(key: string): Promise<T | undefined>
  set(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
  getAll?(): Promise<{ [key: string]: T }>
  clear?(): Promise<void>
}

// one note item
export interface NoteItem {
  data?: string
  endContainer: {
    index: number
    offset: number
    tagName: string
  }
  startContainer: {
    index: number
    offset: number
    tagName: string
  }
}

// notes of one page(site / uri)
export interface WebNote {
  mark: boolean
  notes: {
    [key: string]: NoteItem
  }
}

// selected object on page
export interface Selected {
  selection: Selection
  text: string
  bottom: number
  left: number
}

// message schema send from popup page
type msgtype = 'query_status' | 'change_status' | 'clear_notes'
export interface PopupMsg {
  type: msgtype
  payload?: Record<string, any>
}

// content script message handlers
export interface MessageHandlers {
  [type: string]: (sendResponse: (response?: any) => void, payload: any) => Promise<void>
}
