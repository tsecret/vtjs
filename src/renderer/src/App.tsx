import Versions from './components/Versions'

function App(): React.JSX.Element {

  window.tracker.onMessage((message) => {
    console.log('message from tracker', message)
  })

  const onInit = async () => {
     const response = await window.tracker.init()
     console.log('response', response)
  }

  const loadPlayer = async () => {
     const response = await window.tracker.loadPlayer()
     console.log('player', response)
  }

  const help = async () => {
     const response = await window.tracker.help()
     console.log('help', response)
  }

  return (
    <>
      <button onClick={onInit}>Start</button>
      <button onClick={loadPlayer}>Load Player</button>
      <button onClick={help}>Help</button>
      {/* <div>{player?.game_name}</div> */}
      {/* <Debug config={config} /> */}
      <Versions></Versions>
    </>
  )
}

export default App
