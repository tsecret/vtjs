import { relaunch } from '@tauri-apps/plugin-process';
import { check, Update } from '@tauri-apps/plugin-updater';
import { useAtom } from 'jotai';
import { ArrowBigDown, ChevronLeft, Download, RefreshCcw, RefreshCw, Settings, Store, User, Users } from 'lucide-react';
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router';
import atoms from '../utils/atoms';
import { useLongPress } from 'use-long-press';


export const Header = () => {
  const [update, setUpdate] = useState<Update|null>()
  const [player] = useAtom(atoms.player)
  const [puuid] = useAtom(atoms.puuid)
  const [prefetching] = useAtom(atoms.prefetching)

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

  const handlers = useLongPress(() => {
    navigate('/test')
  });

  useEffect(() => {
    checkForUpdate()
  }, [])

  if (location.pathname === '/')
    return update ? <button className="btn btn-soft btn-primary absolute bottom-8 right-8 z-10" onClick={onUpdate}><Download size={16}/> Update available</button> : null

  return <header className="w-full p-2 flex flex-row items-center space-x-4 px-4">
    {
      location.pathname === '/dashboard' ?
      <>
        <a className="font-bold" href='/'>VTJS</a>
        <div className="badge badge-dash badge-primary" {...handlers()}>Beta</div>

        <div className="ml-auto flex flex-row items-center space-x-2">
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
          { prefetching && <div className='btn btn-soft btn-info btn-sm'><RefreshCw size={16} className='animate-spin' /> Fetching player data</div> }
          <button className="btn btn-soft btn-sm btn-primary rounded-md" onClick={() => navigate(`/player/${puuid}`)}><User size={20} /> My Profile</button>
          <button className="btn btn-soft btn-sm btn-primary rounded-md" onClick={() => navigate('/store')}><Store size={20} /> Store</button>
          <button className="btn btn-soft btn-sm btn-primary rounded-md" onClick={() => navigate('/friends')}><Users size={20} /> Friends</button>
          <button className="btn btn-soft btn-sm btn-primary btn-circle" onClick={() => navigate('/settings')}><Settings size={20} /></button>
        </div>
      </>
      : location.pathname === '/settings' ?
      <>
        <button className="btn btn-primary btn-sm" onClick={(() => navigate(-1))}><ChevronLeft /></button>

        <span className="font-bold">Settings</span>
      </>
      : location.pathname.startsWith('/player/') ?
      <>
        <button className="btn btn-primary btn-sm" onClick={(() => navigate(-1))}><ChevronLeft /></button>

        <span className="font-bold">Player Details</span>
      </>
      : location.pathname.startsWith('/match/') ?
      <>
        <button className="btn btn-primary btn-sm" onClick={(() => navigate(-1))}><ChevronLeft /></button>

        <span className="font-bold">Match Details</span>
      </>
      : location.pathname.startsWith('/store') ?
      <>
        <button className="btn btn-primary btn-sm" onClick={(() => navigate(-1))}><ChevronLeft /></button>

        <span className="font-bold">Store</span>
      </>
      : location.pathname.startsWith('/friends') ?
      <>
        <button className="btn btn-primary btn-sm" onClick={(() => navigate(-1))}><ChevronLeft /></button>

        <span className="font-bold">Friends</span>
      </>
      : location.pathname.startsWith('/test') ?
      <>
        <button className="btn btn-primary btn-sm" onClick={(() => navigate(-1))}><ChevronLeft /></button>

        <span className="font-bold">Test</span>
      </>
      : location.pathname.startsWith('/avoid-list') ?
      <>
        <button className="btn btn-primary btn-sm" onClick={(() => navigate(-1))}><ChevronLeft /></button>
      </>
      : null
    }
  </header>
}
