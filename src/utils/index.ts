import { BaseDirectory, exists, readFile } from '@tauri-apps/plugin-fs';
import { hostname } from '@tauri-apps/plugin-os';
export const isMac = () => navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export const readLockfile = async (): Promise<string> => {
  // C:\\Users\\${os.userInfo().username}\\AppData\\Local\\Riot Games\\Riot Client\\Config\\lockfile
  const path = isMac() ? `./lockfile` : ``

  const currentPlatform = await hostname();
  console.log('hostname', currentPlatform);

  const exist = await exists('\\Local\\Riot Games\\Riot Client\\Config\\lockfile', { baseDir: BaseDirectory.AppLocalData })
  console.log('exists', exist)

  const file = await readFile('\\Local\\Riot Games\\Riot Client\\Config\\lockfile', { baseDir: BaseDirectory.AppLocalData })
  return file.toString()
}

export const parseLockFile = (content: string): [string, string] => {
  const [_, __, port, password, ___] =  content.split(':')

  // return [port, Buffer.from(`riot:${password}`).toString('base64')]

  return [port, password]
}
