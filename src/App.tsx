import { exists } from '@tauri-apps/plugin-fs';
import { useEffect } from "react";
import "./App.css";

function App() {

  async function init(){
    const res = await exists('/Users/tsecret/GitHub/vtjs/tests/lockfile');
    console.log('res', res)
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
