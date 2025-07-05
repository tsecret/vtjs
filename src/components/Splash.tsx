
export const Splash = ({ status }: { status: string }) => {
  return <div className="h-screen w-screen flex flex-col items-center">
      <section className="m-auto text-center">
        <p className="text-8xl font-bold text-primary">VTJS</p>
        <p className="text-xl"><span className="loading loading-spinner mr-4" ></span>{status ?? 'Loading'}</p>
      </section>
  </div>
}
