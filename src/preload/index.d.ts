import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    tracker: {
      init: fn,
      loadPlayer: fn
      help: fn

      onMessage: fn
    }
  }
}
