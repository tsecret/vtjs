import { readFileSync } from 'fs'
import os from 'os'

export const isMac = () => navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export const readLockfile = (): string => {
  const path = isMac() ? `./lockfile` : `C:\\Users\\${os.userInfo().username}\\AppData\\Local\\Riot Games\\Riot Client\\Config\\lockfile`
  return readFileSync(path).toString()
}

export const parseLockFile = (content: string): [string, string] => {
  const [_, __, port, password, ___] =  content.split(':')

  return [port, Buffer.from(`riot:${password}`).toString('base64')]
}
