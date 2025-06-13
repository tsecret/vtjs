import { useEffect, useState } from 'react'
import Versions from './components/Versions'
import { Debug } from './components'

function App(): React.JSX.Element {
  const [config, setConfig] = useState<any>([])

  const onInit = async () => {
    const config = await window.electronAPI.trackerinit()
    setConfig(config)
  }

  useEffect(() => {
    onInit()
  }, [])

  return (
    <>
      <Debug config={config} />
      <Versions></Versions>
    </>
  )
}

export default App
