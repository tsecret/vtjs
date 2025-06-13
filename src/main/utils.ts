import { readFileSync } from 'fs'
import os from 'os'

const isMac = () => navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export const readLockfile = (): string => {
  const path = isMac() ? `./lockfile` : `C:\\Users\\${os.userInfo().username}\\AppData\\Local\\Riot Games\\Riot Client\\Config\\lockfile`
  return readFileSync(path).toString()
}

export const parseLockFile = (content: string) => {
  const [_, port, port2, password, __] =  content.split(':')

  return [parseInt(port), parseInt(port2), Buffer.from(`riot:${password}`).toString('base64')]
}
