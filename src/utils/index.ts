import { localDataDir } from '@tauri-apps/api/path';
import { readTextFile } from '@tauri-apps/plugin-fs';
import lockfile from '../../lockfile.json'
import base64 from 'base-64'

export const isMac = () => navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export const readLockfile = async (): Promise<string> => {
  if (isMac()){
    return lockfile
  } else {
    const path = await localDataDir()
    const file = await readTextFile(path + '\\Riot Games\\Riot Client\\Config\\lockfile')
    return file.toString()
  }
}

export const parseLockFile = (content: string): { port: string, password: string } => {
  const [_, __, port, password, ___] =  content.split(':')

  return { port, password: base64.encode(`riot:${password}`) }
}
