import { relaunch } from '@tauri-apps/plugin-process';
import { check, Update } from '@tauri-apps/plugin-updater';
import { useEffect, useState } from "react";
import { ChevronLeft, Download, Settings } from 'lucide-react'
import { useAtom } from 'jotai';
import atoms from '../utils/atoms'
import { Pages } from '../interface/Pages.enum';

export const Header = () => {
    const [update, setUpdate] = useState<Update|null>()
    const [page, setPage] = useAtom(atoms.page)

  async function checkForUpdate(){
    const update = await check();
    if (update) setUpdate(update)
  }

  async function onUpdate(){
      let downloaded = 0;
      let contentLength = 0;

      await update?.downloadAndInstall(event => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength as number;
            console.log(`started downloading ${event.data.contentLength} bytes`);
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            console.log(`downloaded ${downloaded} from ${contentLength}`);
            break;
          case 'Finished':
            console.log('download finished');
            break;
        }
      })

      await relaunch()
  }

  useEffect(() => {
    checkForUpdate()
  })

  return <div className="w-full p-2 flex flex-row items-center justify-between">
    {
      page === Pages.MAIN ?
      <>
        <span className="font-bold">Valorant+</span>

        <div className="space-x-4">
          { !update && <button className="btn btn-soft btn-primary btn-sm" onClick={onUpdate}><Download size={16} /> Update available</button> }
          <button className="btn btn-soft btn-sm btn-primary btn-circle" onClick={() => setPage(Pages.SETTINGS)}><Settings size={20} /></button>
        </div>
      </>
      : page === Pages.SETTINGS ?
      <>
        <button className="btn btn-primary btn-sm" onClick={(() => setPage(Pages.MAIN))}><ChevronLeft /></button>

        <span className="font-bold">Settings</span>
      </>
      : null

    }
  </div>
}
