import { relaunch } from '@tauri-apps/plugin-process';
import { check, Update } from '@tauri-apps/plugin-updater';
import { ChevronLeft, Download, Settings } from 'lucide-react';
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router';

export const Header = () => {
  const [update, setUpdate] = useState<Update|null>()
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
        <span className="font-bold">Valorant+</span>
        <div className="badge badge-dash badge-primary">Beta</div>

        { update && <button className="btn btn-soft btn-primary btn-sm" onClick={onUpdate}><Download size={16}/> Update available</button> }
        <button className="btn btn-soft btn-sm btn-primary btn-circle ml-auto" onClick={() => navigate('/settings')}><Settings size={20} /></button>
      </>
      : location.pathname === '/settings' ?
      <>
        <button className="btn btn-primary btn-sm" onClick={(() => navigate('/dashboard'))}><ChevronLeft /></button>

        <span className="font-bold">Settings</span>
      </>
      : null

    }
  </div>
}
