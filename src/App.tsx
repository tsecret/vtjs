
import { useEffect } from "react";
import * as utils from './utils'
import "./App.css";

function App() {

  async function init(){
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
