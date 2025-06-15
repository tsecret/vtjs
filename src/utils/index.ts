import { BaseDirectory, exists } from '@tauri-apps/plugin-fs';
import { localDataDir } from '@tauri-apps/api/path';
import { hostname } from '@tauri-apps/plugin-os';
export const isMac = () => navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export const readLockfile = async (): Promise<string> => {
  // C:\\Users\\${os.userInfo().username}\\AppData\\Local\\Riot Games\\Riot Client\\Config\\lockfile


  const currentPlatform = await hostname();
  console.log('hostname', currentPlatform);

  const path = await localDataDir()
  console.log('path', path)

  const exist = await exists(path + '\\Riot Games\\Riot Client\\Config\\lockfile')
  console.log('exists', exist)

  // const file = await readFile('\\Local\\Riot Games\\Riot Client\\Config\\lockfile', { baseDir: BaseDirectory.AppData })
  // return file.toString()

  return ''
}

export const parseLockFile = (content: string): [string, string] => {
  const [_, __, port, password, ___] =  content.split(':')

  // return [port, Buffer.from(`riot:${password}`).toString('base64')]

  return [port, password]
}
