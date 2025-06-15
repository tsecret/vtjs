import { exists } from '@tauri-apps/plugin-fs';
import { useEffect } from "react";
import * as utils from './utils'
import "./App.css";

function App() {

  async function init(){
    const res = await exists('/Users/tsecret/GitHub/vtjs/tests/lockfile');
    console.log('res', res)
    console.log('utils.isMac()', utils.isMac())

    const lockfile = await utils.readLockfile()
    console.log('lockfile', lockfile)
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <main className="container">

    </main>
  );
}

export default App;
