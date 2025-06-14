import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

contextBridge.exposeInMainWorld('tracker', {
  init: () => ipcRenderer.invoke('tracker:init'),
  loadPlayer: () => ipcRenderer.invoke('tracker:loadPlayer'),
  help: () => ipcRenderer.invoke('tracker:help'),

  onMessage: (callback) => ipcRenderer.on('tracker:message', (_event, value) => callback(value))
})



// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
