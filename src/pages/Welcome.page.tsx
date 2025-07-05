import { useAtom } from "jotai"
import { useNavigate } from "react-router"
import atoms from "../utils/atoms"
import { Heart } from "lucide-react"

export const WelcomePage = () => {
  const [store] = useAtom(atoms.store)
  const [, setFirstTimeUser] = useAtom(atoms.firstTimeUser)
  const [allowAnalytics, setAllowAnalytics] = useAtom(atoms.allowAnalytics)

  const navigate = useNavigate()

  async function onStart(){
    setFirstTimeUser(false)
    await store?.set('setFirstTimeUser', false)
    navigate('/dashboard')
  }

  async function onAnalyticsChange(state: boolean){
    await store?.set('allowAnalytics', state)
    setAllowAnalytics(state)
  }

  return <div className="p-4 flex flex-col items-center space-y-4">
    <div className="hero min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Welcome to VTJS!</h1>
          <p className="py-6">Thank you for using the app</p>

          <button className="btn btn-primary my-4" onClick={onStart}>Get Started</button>

          <div id='analytics-prompt' className="alert my-10">
            <span><span className="text-primary font-bold">Enable analytics?</span>This helps us improve the app and provide better experience</span>
            {
              allowAnalytics ?
              <button className="btn btn-success btn-sm btn-soft"><Heart size={16} /> Enabled</button> :
              <button className="btn btn-primary btn-sm btn-soft" onClick={() => onAnalyticsChange(true)}>Enable</button>
            }
          </div>

        </div>
      </div>
    </div>
  </div>
}
