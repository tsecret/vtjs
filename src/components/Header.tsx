import { relaunch } from '@tauri-apps/plugin-process';
import { check, Update } from '@tauri-apps/plugin-updater';
import { useAtom } from 'jotai';
import { ChevronLeft, Download, Settings, Store } from 'lucide-react';
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router';
import atoms from '../utils/atoms';

export const Header = () => {
  const [update, setUpdate] = useState<Update|null>()
  const [player] = useAtom(atoms.player)

  const location = useLocation()
  const navigate = useNavigate()

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

  return <div className="w-full p-2 flex flex-row items-center space-x-4 px-4">
    {
      location.pathname === '/dashboard' ?
      <>
        <span className="font-bold">VTJS</span>
        <div className="badge badge-dash badge-primary">Beta</div>

        <div className="ml-auto flex flex-row items-center space-x-4">
          { update && <button className="btn btn-soft btn-primary btn-sm" onClick={onUpdate}><Download size={16}/> Update available</button> }
          <span>{player?.game_name}{' '}
            <div className="relative group inline-block">
              <span className="block group-hover:hidden select-none tracking-widest">
                ****
              </span>
              <span className="hidden group-hover:block select-none">
                #{player?.tag_line}
              </span>
            </div>
          </span>
          <button className="btn btn-soft btn-sm btn-primary rounded-md ml-auto" onClick={() => navigate('/store')}><Store size={20} /> Store</button>
          <button className="btn btn-soft btn-sm btn-primary btn-circle ml-auto" onClick={() => navigate('/settings')}><Settings size={20} /></button>
        </div>
      </>
      : location.pathname === '/settings' ?
      <>
        <button className="btn btn-primary btn-sm" onClick={(() => navigate('/dashboard'))}><ChevronLeft /></button>

        <span className="font-bold">Settings</span>
      </>
      : location.pathname.startsWith('/player/') ?
      <>
        <button className="btn btn-primary btn-sm" onClick={(() => navigate('/dashboard'))}><ChevronLeft /></button>

        <span className="font-bold">Player Details</span>
      </>
      : location.pathname.startsWith('/store') ?
      <>
        <button className="btn btn-primary btn-sm" onClick={(() => navigate('/dashboard'))}><ChevronLeft /></button>

        <span className="font-bold">Store</span>
      </>
      : null

    }
  </div>
}
