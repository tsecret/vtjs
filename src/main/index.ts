import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as utils from './utils'
import { LocalAPI, SharedAPI } from '../api'
import Websocket from 'ws'

let port: string;
let password: string;
let localapi: LocalAPI
let sharedapi: SharedAPI
let inGame = false
let playerId: string;

let mainWindow: BrowserWindow

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.handle('tracker:init', initTracker)
  ipcMain.handle('tracker:loadPlayer', loadPlayer)
  ipcMain.handle('tracker:help', help)

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function connectWebsocket() {
  const ws = new Websocket(
    `wss://192.168.31.197:${port}`,
    {
      rejectUnauthorized: false,
      headers: { authorization: `Basic ${password}` }
    }
  )

  ws.on('message', (message: Buffer) => {
    try {
      const [_, __, data] = JSON.parse(message.toString())

      if (data.data.exitCode !== 0) return

      if (data.data.phase == 'Gameplay'){
        console.log('Game Started')
        playerId = data.data.launchConfiguration.arguments[3].split('=')[1]

        if (!inGame) onGameStart()
      }

      if (data.data.phase == 'Idle'){
        console.log('Idle')
        inGame = false
      }
    } catch(e){}
  })

  ws.on('open', async () => {
    console.log('Websocket connected')

    const { events } = await help()

    Object.keys(events).forEach(event => {
      ws.send(JSON.stringify([5, event]))
    });
  })
}

async function onGameStart(){
  inGame = true


  // Init Shared API
  const { accessToken, token } = await getEntitlementToken()

  console.log('accessToken, token', accessToken, token)

  sharedapi = new SharedAPI({ entToken: token, authToken: accessToken })

  const { MatchID: matchId } = await sharedapi.getCurrentGamePlayer(playerId)

  console.log('matchId', matchId)
  const match = await sharedapi.getCurrentGameMatch(matchId)

  console.log('match', match)

  return match
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
async function initTracker() {
  const [_port, _password] = utils.parseLockFile(utils.readLockfile())
  port = _port
  password = _password

  connectWebsocket()

  localapi = new LocalAPI({ hostname: 'https://192.168.31.197', port, lockfilePassword: password })

  return [port, password]
}

async function getEntitlementToken(){
  const token = await localapi.getEntitlementToken()
  return token
}

async function loadPlayer(){
  const player = await localapi.getPlayerAccount()
  return player
}

async function help(){
  const help = await localapi.help()
  return help
}
