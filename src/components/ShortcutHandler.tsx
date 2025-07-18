import { getCurrentWindow } from '@tauri-apps/api/window';
import { register, unregisterAll } from '@tauri-apps/plugin-global-shortcut';
import { useEffect } from 'react';

export const ShortcutHandler = () => {

  async function handleShortcut(){
    if (await getCurrentWindow().isAlwaysOnTop()){
      getCurrentWindow().setAlwaysOnTop(false)
      getCurrentWindow().setDecorations(true)
    } else {
      getCurrentWindow().setAlwaysOnTop(true)
      getCurrentWindow().setDecorations(false)
    }
  }

  useEffect(() => {

    const init = async () => {

      await register('CommandOrControl+Shift+V', (event) => {
        if (event.state === 'Pressed'){
          handleShortcut()
        }
      });
    }

    init()
    return () => {
      unregisterAll()
    }
  }, [])

  return null
}
