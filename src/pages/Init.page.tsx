import { useNavigate } from "react-router";

export const InitPage = ({ status, error }: { status: string, error: string | null }) => {

  const navigate = useNavigate()

  return <div className="h-screen w-screen flex flex-col items-center bg-primary/15 relative justify-evenly">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] bg-black"></div>

      <section className="text-center space-y-4">
        <p className="text-8xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">VTJS</p>

        {
          error ?
            <div className="alert alert-error">{error}</div> :
            <p className="text-xl"><span className="loading loading-spinner mr-4" ></span>{status || 'Loading'}</p>
        }

        <button className="btn btn-sm btn-primary" onClick={() => navigate(0)}>Reload</button>
      </section>

      {/* <section className="flex flex-row space-x-4">
        <a className="btn btn-sm btn-soft" href="https://www.facebook.com/aiocean.io/" target='_blank'><Github size={16} />GitHub</a>
      </section> */}
  </div>
}
